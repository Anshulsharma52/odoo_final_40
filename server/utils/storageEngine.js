const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Collection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(content || '[]');
      }
    } catch (e) {
      console.error(`Error loading collection ${this.name}:`, e.message);
    }
    return [];
  }

  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error(`Error saving collection ${this.name}:`, e.message);
    }
  }

  _matches(item, query = {}) {
    if (!query || Object.keys(query).length === 0) return true;
    for (const [key, val] of Object.entries(query)) {
      if (key === '$or' && Array.isArray(val)) {
        const anyMatch = val.some(subQuery => this._matches(item, subQuery));
        if (!anyMatch) return false;
        continue;
      }
      if (key === '$and' && Array.isArray(val)) {
        const allMatch = val.every(subQuery => this._matches(item, subQuery));
        if (!allMatch) return false;
        continue;
      }
      const itemVal = item[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if (val.$regex) {
          const regex = new RegExp(val.$regex, val.$options || 'i');
          if (!regex.test(String(itemVal || ''))) return false;
        } else if (val.$in && Array.isArray(val.$in)) {
          if (!val.$in.includes(itemVal)) return false;
        } else if (val.$ne !== undefined) {
          if (itemVal === val.$ne) return false;
        } else if (val.$gte !== undefined && (itemVal < val.$gte)) {
          return false;
        } else if (val.$lte !== undefined && (itemVal > val.$lte)) {
          return false;
        } else if (val.$gt !== undefined && (itemVal <= val.$gt)) {
          return false;
        } else if (val.$lt !== undefined && (itemVal >= val.$lt)) {
          return false;
        }
      } else if (itemVal !== val) {
        return false;
      }
    }
    return true;
  }

  async find(query = {}) {
    const results = this.data.filter(item => this._matches(item, query));
    return new QueryBuilder(results, this);
  }

  async findOne(query = {}) {
    const item = this.data.find(it => this._matches(it, query));
    return item ? { ...item } : null;
  }

  async findById(id) {
    if (!id) return null;
    const item = this.data.find(it => String(it._id) === String(id) || String(it.id) === String(id));
    return item ? { ...item } : null;
  }

  async create(doc) {
    const now = new Date().toISOString();
    const newDoc = {
      _id: doc._id || uuidv4().replace(/-/g, '').slice(0, 24),
      ...doc,
      createdAt: doc.createdAt || now,
      updatedAt: now
    };
    this.data.unshift(newDoc);
    this._save();
    return { ...newDoc };
  }

  async insertMany(docs) {
    const results = [];
    for (const d of docs) {
      results.push(await this.create(d));
    }
    return results;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const index = this.data.findIndex(it => String(it._id) === String(id) || String(it.id) === String(id));
    if (index === -1) return null;
    const updateFields = update.$set ? { ...update.$set } : { ...update };
    delete updateFields.$inc;
    
    if (update.$inc) {
      for (const [incKey, incVal] of Object.entries(update.$inc)) {
        updateFields[incKey] = (this.data[index][incKey] || 0) + Number(incVal);
      }
    }

    this.data[index] = {
      ...this.data[index],
      ...updateFields,
      updatedAt: new Date().toISOString()
    };
    this._save();
    return { ...this.data[index] };
  }

  async updateOne(query, update) {
    const item = this.data.find(it => this._matches(it, query));
    if (!item) return { modifiedCount: 0 };
    return this.findByIdAndUpdate(item._id, update);
  }

  async updateMany(query, update) {
    let count = 0;
    this.data.forEach((item, index) => {
      if (this._matches(item, query)) {
        const updateFields = update.$set ? { ...update.$set } : { ...update };
        this.data[index] = {
          ...this.data[index],
          ...updateFields,
          updatedAt: new Date().toISOString()
        };
        count++;
      }
    });
    this._save();
    return { modifiedCount: count };
  }

  async deleteOne(query) {
    const index = this.data.findIndex(it => this._matches(it, query));
    if (index === -1) return { deletedCount: 0 };
    this.data.splice(index, 1);
    this._save();
    return { deletedCount: 1 };
  }

  async findByIdAndDelete(id) {
    return this.deleteOne({ _id: id });
  }

  async countDocuments(query = {}) {
    return this.data.filter(it => this._matches(it, query)).length;
  }
}

class QueryBuilder {
  constructor(data, collection) {
    this.results = [...data];
    this.collection = collection;
  }

  sort(sortCriteria) {
    if (!sortCriteria) return this;
    if (typeof sortCriteria === 'object') {
      const [key, dir] = Object.entries(sortCriteria)[0] || [];
      if (key) {
        this.results.sort((a, b) => {
          if (a[key] < b[key]) return dir === -1 ? 1 : -1;
          if (a[key] > b[key]) return dir === -1 ? -1 : 1;
          return 0;
        });
      }
    }
    return this;
  }

  limit(count) {
    if (count > 0) {
      this.results = this.results.slice(0, count);
    }
    return this;
  }

  skip(count) {
    if (count > 0) {
      this.results = this.results.slice(count);
    }
    return this;
  }

  populate() {
    // Populate is handled or optional for embedded docs
    return this;
  }

  then(resolve, reject) {
    return Promise.resolve(this.results).then(resolve, reject);
  }
}

const collections = {};

function getModel(name) {
  if (!collections[name]) {
    collections[name] = new Collection(name);
  }
  return collections[name];
}

module.exports = {
  getModel
};
