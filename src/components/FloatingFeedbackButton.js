import { useState, useRef, useEffect} from "react";
import { FiMail } from "react-icons/fi"; // 邮件图标
import { IoClose } from "react-icons/io5"; // 关闭按钮

export default function FloatingFeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const formRef = useRef(null); // 用于检测点击区域

    // 初始化时从 localStorage 读取数据
    useEffect(() => {
        setEmail(localStorage.getItem("feedback_email") || "");
        setMessage(localStorage.getItem("feedback_message") || "");
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            window.addEventListener("click", handleClickOutside);
        } else {
            window.removeEventListener("click", handleClickOutside);
        }

        return () => window.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    // 处理 Email 和 Message 的输入，同时存入 localStorage
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        localStorage.setItem("feedback_email", e.target.value);
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        localStorage.setItem("feedback_message", e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 构造 `mailto:` URL
        const mailtoLink = `mailto:biomindbot@gmail.com?subject=Customer Feedback&body=${encodeURIComponent(message)}`;

        // 打开邮件客户端
        window.location.href = mailtoLink;

        // 清空表单并清除 localStorage
        setEmail("");
        setMessage("");
        localStorage.removeItem("feedback_email");
        localStorage.removeItem("feedback_message");

        // 关闭表单
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-12 right-12 z-50 flex flex-col items-end">
            {/* 反馈表单 */}
            {isOpen && (
                <div ref={formRef} className="bg-white shadow-lg p-4 rounded-lg w-80 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">Feedback</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-600 transition duration-200"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="customer_email"
                            value={email}
                            onChange={handleEmailChange}
                            className="w-full p-2 border rounded-md"
                            placeholder="Your email address..."
                            required
                        />
                        <textarea
                            name="message"
                            rows="5"
                            value={message}
                            onChange={handleMessageChange}
                            className="w-full p-2 border rounded-md mt-2"
                            placeholder="Leave your feedback here..."
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="bg-black text-white w-full py-2 rounded-md mt-2 hover:bg-gray-800 transition duration-300"
                        >
                            Send Feedback
                        </button>
                    </form>
                </div>
            )}

            {/* 悬浮按钮 */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // 防止点击按钮时关闭表单
                    setIsOpen(!isOpen);
                }}
                className="bg-gray-100 text-black p-4 rounded-full shadow-lg hover:scale-110 transition duration-300 ease-out"
            >
                <FiMail size={28} />
            </button>
        </div>
    );
}
