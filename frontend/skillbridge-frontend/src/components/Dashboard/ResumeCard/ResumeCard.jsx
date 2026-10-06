import { useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadResume } from "../../../services/api";

function ResumeCard({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    // Backend currently accepts PDF only
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }

    // Maximum 5 MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB.");
      return;
    }

    setFile(selectedFile);
    setUploadProgress(0);

    toast.success("Resume selected successfully!");
  };

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;

    processFile(e.target.files[0]);

    // Allows selecting the same file again later
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();

    if (!uploading && !analyzing) {
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

    if (uploading || analyzing) return;

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const removeFile = () => {
    if (uploading || analyzing) return;

    setFile(null);
    setUploadProgress(0);

    toast("Resume removed.", {
      icon: "🗑️",
    });
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload a resume first.");
      return;
    }

    try {
      setAnalyzing(true);
      setUploadProgress(10);

      toast.loading("Uploading resume and analyzing with AI...", {
        id: "resume-analysis",
      });

      // REAL BACKEND API CALL
      const result = await uploadResume(file);

      setUploadProgress(100);

      console.log("Real AI analysis response:", result);

      toast.success("AI analysis completed successfully!", {
        id: "resume-analysis",
      });

      // Send the REAL backend result to CareerDashboard
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error("Resume analysis failed:", error);

      toast.error(
        error.message || "Failed to analyze resume. Please try again.",
        {
          id: "resume-analysis",
        }
      );
    } finally {
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-8">

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
            <FileText
              size={24}
              className="text-purple-600"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-black">
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
              ? "border-purple-600 bg-purple-100 scale-[1.01] shadow-lg"
              : "border-purple-300 bg-gradient-to-br from-white to-purple-50 hover:border-pink-500 hover:shadow-lg"
          }

          ${
            uploading || analyzing
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
            bg-purple-100
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
                ? "bg-purple-600 scale-110"
                : "bg-purple-100 group-hover:bg-purple-600 group-hover:scale-105"
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
                  : "text-purple-600 group-hover:text-white"
              }
            `}
          />
        </div>

        {/* Title */}
        <h3 className="relative text-xl font-bold text-black">
          {dragging
            ? "Drop Your Resume Here"
            : "Upload Your Resume"}
        </h3>

        {/* Description */}
        <p className="relative text-gray-500 mt-2">
          Drag & Drop your resume here
        </p>

        <span className="relative text-sm text-gray-400 mt-2">
          PDF • Maximum 5 MB
        </span>

        {/* Browse Button */}
        <span
          className="
            relative
            mt-6
            px-7
            py-3
            bg-purple-600
            text-white
            rounded-xl
            font-semibold
            shadow-sm
            group-hover:bg-pink-600
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
          accept=".pdf,application/pdf"
          className="hidden"
          disabled={uploading || analyzing}
          onChange={handleFileChange}
        />

      </label>

      {/* Upload / Analysis Progress */}
      {analyzing && (
        <div className="mt-6 bg-purple-50 rounded-xl p-5">

          <div className="flex justify-between items-center text-sm mb-3">

            <div className="flex items-center gap-2 text-purple-700 font-medium">
              <Sparkles size={17} />
              AI is analyzing your resume...
            </div>

            <span className="font-bold text-purple-700">
              {uploadProgress}%
            </span>

          </div>

          <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">

            <div
              className="
                h-full
                bg-purple-600
                rounded-full
                transition-all
                duration-300
              "
              style={{
                width: `${uploadProgress}%`,
              }}
            />

          </div>

        </div>
      )}

      {/* Selected File */}
      {file && !analyzing && (
        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            gap-4
            bg-purple-50
            border
            border-purple-100
            rounded-xl
            p-4
            hover:shadow-sm
            transition
          "
        >

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">

              <FileText
                size={22}
                className="text-purple-600"
              />

            </div>

            <div className="min-w-0">

              <p className="font-semibold text-black truncate">
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
        disabled={analyzing || uploading || !file}
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
            analyzing || uploading || !file
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-pink-600 hover:shadow-lg hover:-translate-y-0.5"
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