interface Option {
  value: string;
  label: string;
}

interface SingleProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  multi?: false;
}

interface MultiProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  multi: true;
  max?: number;
}

type ChipGroupProps = SingleProps | MultiProps;

export default function ChipGroup(props: ChipGroupProps) {
  if (props.multi) {
    const { options, value, onChange, max } = props;
    return (
      <div className="chip-row">
        {options.map((opt) => {
          const active = value.includes(opt.value);
          const atMax = max !== undefined && value.length >= max && !active;
          return (
            <button
              type="button"
              key={opt.value}
              className={`chip${active ? " active" : ""}`}
              disabled={atMax}
              onClick={() => onChange(active ? value.filter((v) => v !== opt.value) : [...value, opt.value])}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  const { options, value, onChange } = props;
  return (
    <div className="chip-row">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          className={`chip${value === opt.value ? " active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
