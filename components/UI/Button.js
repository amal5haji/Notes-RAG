export default function Button({ children, onClick, type = "button", className = "" }) {
    return (
        <button onClick={onClick} type={type} className={`py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 ${className}`}>
            {children}
        </button>
    );
}