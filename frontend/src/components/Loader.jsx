const Loader = ({ text = "" }) => (
    <div className="spinner-overlay" role="status" aria-live="polite">
        <div className="spinner"></div>
        {text && <p className="loader-text">{text}</p>}
    </div>
);

export default Loader;