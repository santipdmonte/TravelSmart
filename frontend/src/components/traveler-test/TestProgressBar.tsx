interface TestProgressBarProps {
  current: number;
  total: number;
}

export default function TestProgressBar({
  current,
  total,
}: TestProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
      <div
        className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
      <p className="text-center text-sm text-gray-500 mt-6 mb-4">{`Pregunta ${current} de ${total}`}</p>
    </div>
  );
}
