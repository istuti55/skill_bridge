import { motion } from "framer-motion";

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="
        relative
        bg-white
        rounded-2xl
        overflow-hidden
        border
        border-gray-100
        p-6
        shadow-sm
        hover:shadow-xl
        transition-shadow
        duration-300
      "
    >
      {/* Colored Top Accent */}
      <div
        className="absolute top-0 left-0 w-full h-1.5"
        style={{ backgroundColor: color }}
      />

      {/* Card Content */}
      <div className="flex items-start justify-between gap-4 pt-1">

        {/* Left Content */}
        <div className="min-w-0">

          {/* Title */}
          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>

          {/* Main Value */}
          <h2 className="text-4xl font-bold text-gray-900 mt-3">
            {value}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-500 text-sm mt-2">
            {subtitle}
          </p>

          {/* Trend */}
          {trend && (
            <p className="text-green-600 text-sm font-semibold mt-4">
              {trend}
            </p>
          )}

        </div>

        {/* Icon */}
        <div
          className="
            w-16
            h-16
            min-w-16
            rounded-2xl
            flex
            items-center
            justify-center
            text-white
            shadow-md
          "
          style={{
            backgroundColor: color,
          }}
        >
          {icon}
        </div>

      </div>
    </motion.div>
  );
}

export default DashboardCard;