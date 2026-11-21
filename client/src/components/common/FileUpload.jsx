import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FileUpload = ({ label = 'Upload Site Photographs / Documents', onUploadSuccess, currentUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setPreview(res.data.url);
        if (onUploadSuccess) onUploadSuccess(res.data.url);
        toast.success('File uploaded successfully');
      }
    } catch (err) {
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-50 hover:bg-emerald-50/20 transition-all cursor-pointer">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-2 text-emerald-600">
            <Loader2 className="w-7 h-7 animate-spin mb-1" />
            <span className="text-xs font-medium">Uploading file...</span>
          </div>
        ) : preview ? (
          <div className="flex items-center justify-center gap-3">
            <img src={preview} alt="Upload preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
            <div className="text-left">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Uploaded Ready
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Click to replace photo</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
            <span className="text-xs font-medium text-slate-700">Click or drag photo here to upload</span>
            <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 10MB</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
