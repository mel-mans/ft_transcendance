import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = [
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "CHF", symbol: "CHF" },
  { code: "JPY", symbol: "¥" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
  { code: "MAD", symbol: "Dh" },
];

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CurrencySelect = ({ value, onChange }: CurrencySelectProps) => {
  const selected = CURRENCIES.find((c) => c.code === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[96px] shrink-0 bg-white/5 border-white/10">
        <SelectValue>{selected ? `${selected.symbol} ${selected.code}` : value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="font-medium">{c.symbol}</span>
            <span className="ml-1.5 text-muted-foreground text-xs">{c.code}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelect;
