import { useEffect, useRef } from 'react';

const useFirstRender = () => {
    const firstRender = useRef(true);

    useEffect(() => {
        firstRender.current = false;
    }, []);

    return firstRender.current;
}

export default useFirstRender;