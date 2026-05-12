export default function Footer() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} Planifica</span>
      <span className="footer-separator">•</span>
      <span>Organiza tu vida. Sin ruido.</span>
    </footer>
  );
}
