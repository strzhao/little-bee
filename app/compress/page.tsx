"use client";

import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// --- UI Components ---
// Assuming shadcn/ui components are located here.
// If not, we may need to create these simple components.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// --- Helper Icons ---
const UploadCloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const FileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);


const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
);


// --- Types ---
interface CompressedFileResult {
  originalFile: File;
  compressedFile: Blob;
  originalSize: number;
  compressedSize: number;
  previewUrl: string;
}

// --- Helper Functions ---
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// --- Main Component ---
export default function ImageCompressorPage() {
  const [compressedResults, setCompressedResults] = useState<CompressedFileResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await processFiles(Array.from(files));
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files) {
      await processFiles(Array.from(files));
    }
  };

  const processFiles = async (files: File[]) => {
    setIsCompressing(true);
    setTotalFiles(files.length);
    setProcessedFiles(0);
    setCompressedResults([]);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const newResults: CompressedFileResult[] = [];
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        try {
            const compressedFile = await imageCompression(file, options);
            const result: CompressedFileResult = {
                originalFile: file,
                compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                previewUrl: URL.createObjectURL(compressedFile),
            };
            newResults.push(result);
        } catch (error) {
            console.error("Error compressing file:", error);
            // Optionally, add a failed result to show in the UI
        }
        setProcessedFiles(prev => prev + 1);
    }
    
    setCompressedResults(newResults);
    setIsCompressing(false);
  };

  const handleDownload = (result: CompressedFileResult) => {
    saveAs(result.compressedFile, `compressed-${result.originalFile.name}`);
  };

  const handleDownloadAll = async () => {
    if (compressedResults.length === 0) return;
    setIsZipping(true);
    const zip = new JSZip();
    compressedResults.forEach((result) => {
      zip.file(`compressed-${result.originalFile.name}`, result.compressedFile);
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "compressed-images.zip");
    setIsZipping(false);
  };

  const handleClear = () => {
    compressedResults.forEach(result => URL.revokeObjectURL(result.previewUrl));
    setCompressedResults([]);
    setTotalFiles(0);
    setProcessedFiles(0);
  };

  const UploadArea = () => (
    <div 
        className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-10 p-10 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-colors"
        onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
    >
        <UploadCloudIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">拖拽或点击上传图片</h2>
        <p className="text-gray-500 mt-2">支持 JPG, PNG, WEBP 等格式，可批量上传</p>
        <Input id="file-input" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );

  const CompressionProgress = () => (
    <div className="w-full max-w-2xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">正在为您压缩图片...</h2>
        <Progress value={(processedFiles / totalFiles) * 100} className="w-full" />
        <p className="text-gray-500 mt-2">{processedFiles} / {totalFiles} 张已处理</p>
    </div>
  );

  const ResultsView = () => (
    <div className="w-full max-w-6xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">压缩完成</h2>
            <div className="flex gap-4">
                <Button onClick={handleClear} variant="outline">清空全部</Button>
                <Button onClick={handleDownloadAll} disabled={isZipping}>
                    {isZipping ? "正在打包..." : "下载全部 (.zip)"}
                </Button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {compressedResults.map((result, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardHeader className="p-0">
                        <img src={result.previewUrl} alt={result.originalFile.name} className="w-full h-48 object-cover" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <p className="text-sm font-medium truncate mb-2" title={result.originalFile.name}>{result.originalFile.name}</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">原大小:</span>
                            <span className="font-mono">{formatBytes(result.originalSize)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-semibold text-green-600">
                            <span>新大小:</span>
                            <span className="font-mono">{formatBytes(result.compressedSize)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 my-3">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(result.compressedSize / result.originalSize) * 100}%` }}></div>
                        </div>
                        <div className="text-center text-lg font-bold text-green-600 mb-3">
                            ↓ {Math.round(100 - (result.compressedSize / result.originalSize) * 100)}%
                        </div>
                        <Button className="w-full" onClick={() => handleDownload(result)}>
                            <DownloadIcon className="mr-2 h-4 w-4" /> 下载
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">图像压缩工具</h1>
            <p className="mt-4 text-lg text-gray-600">在您的浏览器中快速、安全地批量压缩图片。</p>
        </div>

        {isCompressing ? <CompressionProgress /> : (compressedResults.length === 0 ? <UploadArea /> : <ResultsView />)}
    </main>
  );
}
