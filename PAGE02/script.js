// 영상 제어 및 랙포커스 연출
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const video = document.querySelector('.logo-animation');
    const bgGroup = document.querySelector('.background-group');
    const bgPhoto = document.querySelector('.bg-photo');
    const bgChange = document.querySelector('.bg-change');
    const bgTwo = document.querySelector('.bg-two');

    if (!video) return;

    // 패럴랙스 활성화 상태
    let parallaxEnabled = false;
    let isVideoPlaying = false;

    // 마우스 패럴랙스 설정
    const parallaxConfig = {
        bgPhoto: { depth: 0.02, rotate: true },
        bgChange: { depth: 0.04, rotate: true },
        bgTwo: { depth: 0.06, rotate: true }
    };
    const maxRotation = 3; // 최대 회전 각도 (도)

    // 마우스 이동 핸들러
    function handleMouseMove(e) {
        if (!parallaxEnabled || isVideoPlaying) return;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // 정규화 (-1 ~ 1)
        const normalizedX = mouseX / centerX;
        const normalizedY = mouseY / centerY;

        // 각 레이어 이동
        if (bgPhoto) {
            const depth = parallaxConfig.bgPhoto.depth;
            const moveX = normalizedX * depth * 100;
            const moveY = normalizedY * depth * 100;
            bgPhoto.style.transform = `translateZ(-100px) scale(1.1) translate(${moveX}px, ${moveY}px)`;
        }

        if (bgChange) {
            const depth = parallaxConfig.bgChange.depth;
            const moveX = normalizedX * depth * 100;
            const moveY = normalizedY * depth * 100;
            bgChange.style.transform = `translateZ(-50px) scale(1.05) translate(${moveX}px, ${moveY}px)`;
        }

        if (bgTwo) {
            const depth = parallaxConfig.bgTwo.depth;
            const moveX = normalizedX * depth * 100;
            const moveY = normalizedY * depth * 100;
            bgTwo.style.transform = `translateZ(0px) translate(${moveX}px, ${moveY}px)`;
        }

        // 3D 회전 효과
        if (bgGroup) {
            const rotateX = -normalizedY * maxRotation;
            const rotateY = normalizedX * maxRotation;
            bgGroup.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    }

    // 패럴랙스 리셋
    function resetParallax() {
        if (bgPhoto) bgPhoto.style.transform = 'translateZ(-100px) scale(1.1)';
        if (bgChange) bgChange.style.transform = 'translateZ(-50px) scale(1.05)';
        if (bgTwo) bgTwo.style.transform = 'translateZ(0px)';
        if (bgGroup) bgGroup.style.transform = '';
    }

    // 마우스 이벤트 등록
    document.addEventListener('mousemove', handleMouseMove);

    function startSequence() {
        // Phase 1: 페이드인 + background/big_2 포커스
        bgGroup.classList.add('visible', 'phase1');
        parallaxEnabled = true; // 패럴랙스 시작

        // Phase 2: big_change 포커스 (1.5초 후)
        setTimeout(function() {
            bgGroup.classList.remove('phase1');
            bgGroup.classList.add('phase2');
        }, 1500);

        // 영상 재생 (3초 후) + Phase 3: 전체 블러
        setTimeout(function() {
            bgGroup.classList.remove('phase2');
            bgGroup.classList.add('phase3');
            isVideoPlaying = true;
            resetParallax(); // 영상 시작 시 패럴랙스 리셋

            video.play().then(function() {
                video.classList.add('playing');
            }).catch(function(e) {
                console.log('Video play error:', e);
                video.classList.add('playing');
            });
        }, 3000);
    }

    // 영상 프리로드 완료 후 시퀀스 시작
    if (video.readyState >= 3) {
        startSequence();
    } else {
        video.addEventListener('canplaythrough', startSequence, { once: true });
    }

    // 영상 끝나면 네이버 버튼 표시
    video.addEventListener('ended', function() {
        if (naverBtn) {
            naverBtn.classList.add('visible');
        }
    });
})();
