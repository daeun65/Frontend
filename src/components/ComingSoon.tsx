interface ComingSoonProps {
  title: string;
  desc?: string;
}

export default function ComingSoon({ title, desc }: ComingSoonProps) {
  return (
    <div className="state-panel">
      <span className="serif">{title}</span>
      <p>{desc ?? "다음 단계에서 이어서 만들 예정이에요."}</p>
    </div>
  );
}
