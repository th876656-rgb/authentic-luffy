import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Cần setTimeout ngắn để đảm bảo DOM render xong trang mới rồi mới cuộn
        // Trên mobile browser (Safari/Chrome) đôi khi render chậm hơn thời điểm pathname thay đổi
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
            // Backup for some older mobile browsers
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 10);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
