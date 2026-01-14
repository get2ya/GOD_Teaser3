// GOH 타이틀 영상 페이지 (반응형 영상 소스)
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo) return;

    // 디바이스에 따른 영상 소스 선택
    // 폴드7 이상 (화면 너비 768px 이상): 1080p
    // 일반 모바일: 720p
    function getVideoSource() {
        const screenWidth = window.screen.width;
        const isHighRes = screenWidth >= 768;

        // iOS/Mac 감지
        const isApple = /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent);

        if (isHighRes) {
            return isApple
                ? '../resource/MV/GOH_1080.mov'
                : '../resource/MV/GOH_1080.webm';
        } else {
            return isApple
                ? '../resource/MV/GOH_720.mov'
                : '../resource/MV/GOH_720.webm';
        }
    }

    // 영상 소스 설정
    function setVideoSource() {
        const source = document.createElement('source');
        const videoPath = getVideoSource();

        source.src = videoPath;
        source.type = videoPath.endsWith('.mov') ? 'video/quicktime' : 'video/webm';

        mainVideo.appendChild(source);
        mainVideo.load();
    }

    // 영상 종료 1초 전 네이버 버튼 표시
    mainVideo.addEventListener('timeupdate', function() {
        if (!mainVideo.duration) return;
        const remaining = mainVideo.duration - mainVideo.currentTime;
        if (remaining <= 1 && naverBtn && !naverBtn.classList.contains('visible')) {
            naverBtn.classList.add('visible');
        }
    });

    // 영상 로드 완료 후 시작
    function startSequence() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        // 영상 페이드인 + 재생
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});
    }

    // 초기화
    setVideoSource();

    // 영상 로드 대기
    if (mainVideo.readyState >= 3) {
        startSequence();
    } else {
        mainVideo.addEventListener('canplaythrough', startSequence, { once: true });
    }
})();
