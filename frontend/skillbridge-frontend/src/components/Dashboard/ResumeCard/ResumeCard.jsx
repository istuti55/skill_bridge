import { useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

function ResumeCard({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    // File type validation
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    // File size validation - 5 MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;

      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          setUploading(false);
          setFile(selectedFile);
          setUploadProgress(0);

          toast.success("Resume uploaded successfully!");
        }, 300);
      }
    }, 150);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;

    processFile(e.target.files[0]);

    // Allows selecting the same file again later
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();

    if (!uploading) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setDragging(false);

    if (uploading) return;

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);

    toast("Resume removed.", {
      icon: "🗑️",
    });
  };

  const handleAnalyze = () => {
    if (!file) {
      toast.error("Please upload a resume first.");
      return;
    }

    setAnalyzing(true);

    setTimeout(() => {
      setAnalyzing(false);

      toast.success("AI analysis completed successfully!");

      // Tell CareerDashboard that analysis is complete
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
            <FileText
              size={24}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Resume Management
            </h2>

            <p className="text-gray-500 mt-1">
              Upload your latest resume and analyze it with AI.
            </p>
          </div>

        </div>
      </div>

      {/* Upload Area */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          group
          relative
          border-2
          border-dashed
          rounded-2xl
          p-10
          md:p-12
          flex
          flex-col
          items-center
          justify-center
          text-center
          transition-all
          duration-300
          overflow-hidden

          ${
            dragging
              ? "border-blue-600 bg-blue-100 scale-[1.01] shadow-lg"
              : "border-blue-300 bg-gradient-to-br from-white to-blue-50 hover:border-blue-500 hover:shadow-lg"
          }

          ${
            uploading
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer"
          }
        `}
      >

        {/* Decorative background */}
        <div
          className="
            absolute
            -top-16
            -right-16
            w-40
            h-40
            bg-blue-100
            rounded-full
            opacity-40
            group-hover:scale-125
            transition-transform
            duration-500
          "
        />

        {/* Upload Icon */}
        <div
          className={`
            relative
            w-20
            h-20
            rounded-full
            flex
            items-center
            justify-center
            mb-5
            transition-all
            duration-300

            ${
              dragging
                ? "bg-blue-600 scale-110"
                : "bg-blue-100 group-hover:bg-blue-600 group-hover:scale-105"
            }
          `}
        >
          <Upload
            size={38}
            className={`
              transition-colors duration-300

              ${
                dragging
                  ? "text-white"
                  : "text-blue-600 group-hover:text-white"
              }
            `}
          />
        </div>

        {/* Title */}
        <h3 className="relative text-xl font-bold text-gray-800">
          {dragging
            ? "Drop Your Resume Here"
            : "Upload Your Resume"}
        </h3>

        {/* Description */}
        <p className="relative text-gray-500 mt-2">
          Drag & Drop your resume here
        </p>

        <span className="relative text-sm text-gray-400 mt-2">
          PDF, DOC, DOCX • Maximum 5 MB
        </span>

        {/* Browse Button */}
        <span
          className="
            relative
            mt-6
            px-7
            py-3
            bg-blue-600
            text-white
            rounded-xl
            font-semibold
            shadow-sm
            group-hover:bg-blue-700
            group-hover:shadow-md
            transition-all
            duration-300
          "
        >
          Browse Files
        </span>

        {/* Hidden Input */}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />

      </label>

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-6 bg-blue-50 rounded-xl p-5">

          <div className="flex justify-between items-center text-sm mb-3">

            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <Upload size={17} />
              Uploading Resume...
            </div>

            <span className="font-bold text-blue-700">
              {uploadProgress}%
            </span>

          </div>

          <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">

            <div
              className="
                h-full
                bg-blue-600
                rounded-full
                transition-all
                duration-150
              "
              style={{
                width: `${uploadProgress}%`,
              }}
            />

          </div>

        </div>
      )}

      {/* Selected File */}
      {file && !uploading && (
        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            gap-4
            bg-blue-50
            border
            border-blue-100
            rounded-xl
            p-4
            hover:shadow-sm
            transition
          "
        >

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">

              <FileText
                size={22}
                className="text-blue-600"
              />

            </div>

            <div className="min-w-0">

              <p className="font-semibold text-gray-800 truncate">
                {file.name}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={removeFile}
            className="
              w-10
              h-10
              rounded-xl
              flex
              items-center
              justify-center
              text-red-500
              hover:bg-red-100
              hover:text-red-600
              transition
              flex-shrink-0
            "
            title="Remove resume"
          >
            <Trash2 size={20} />
          </button>

        </div>
      )}

      {/* Analyze Button */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={analyzing || uploading}
        className={`
          mt-6
          w-full
          py-3.5
          rounded-xl
          font-semibold
          text-white
          transition-all
          duration-300
          flex
          items-center
          justify-center
          gap-3
          shadow-sm

          ${
            analyzing || uploading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
          }
        `}
      >

        {analyzing ? (
          <>
            <div
              className="
                w-5
                h-5
                border-2
                border-white
                border-t-transparent
                rounded-full
                animate-spin
              "
            />

            Analyzing Resume...
          </>
        ) : (
          <>
            <Sparkles size={19} />

            Analyze Resume
          </>
        )}

      </button>

      {/* Small Status */}
      {file && !analyzing && (
        <div className="flex justify-center items-center gap-2 mt-4 text-sm text-green-600">

          <CheckCircle2 size={16} />

          Resume ready for AI analysis

        </div>
      )}

    </div>
  );
}

export default ResumeCard;