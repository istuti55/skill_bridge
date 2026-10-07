import { useState } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";

import { createReview } from "../../services/api";

const MAX_COMMENT = 500;

// Props:
//   targetUserId - user id of the person being reviewed
//   targetName   - name shown in the title
//   onClose      - called when the modal should close
function ReviewModal({ targetUserId, targetName, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [report, setReport] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (rating < 1) {
      toast.error("Please choose a rating from 1 to 5.");
      return;
    }

    setSaving(true);
    try {
      await createReview({
        targetUserId,
        rating,
        comment: comment.trim(),
        report,
      });
      toast.success("Review submitted");
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not submit the review.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Review {targetName || "this user"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your review is visible to the SkillBridge admin team.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-gray-700">Rating</p>
          <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
              >
                <Star
                  size={30}
                  className={
                    value <= (hover || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(event) =>
              setComment(event.target.value.slice(0, MAX_COMMENT))
            }
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="How was your experience?"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {comment.length}/{MAX_COMMENT}
          </p>
        </div>

        <label className="mt-3 flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={report}
            onChange={(event) => setReport(event.target.checked)}
            className="mt-0.5"
          />
          <span>Also report this user to the admin team</span>
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

export default ReviewModal;
