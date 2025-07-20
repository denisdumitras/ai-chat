import { FaExclamationTriangle } from "react-icons/fa";
import styles from "./ErrorBanner.module.css";

interface ErrorBannerProps {
  message?: string | null;
}

function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className={styles.errorBanner}>
      <div className={styles.errorBannerContent}>
        <FaExclamationTriangle className={styles.errorIcon} />
        <span className={styles.errorText}>
          {message
            ? message
            : "The connection was lost. Please refresh the page."}
        </span>
      </div>
    </div>
  );
}

export default ErrorBanner;
