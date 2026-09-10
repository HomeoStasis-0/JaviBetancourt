export default function TerminalLine({ command }: { command: string }) {
  return (
    <p className="font-mono text-sm text-cyan">
      <span className="text-magenta">$</span> {command}
      <span className="cursor-blink text-cyan">_</span>
    </p>
  );
}
