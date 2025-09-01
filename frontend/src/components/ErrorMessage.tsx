import { Alert, AlertDescription, Button } from "@/components";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className={className}>
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <AlertDescription>
        {message}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="link"
            size="sm"
            className="mt-2 text-destructive hover:text-destructive/80 p-0 h-auto"
          >
            Intentar de nuevo
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
