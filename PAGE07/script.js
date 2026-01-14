// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// 배경 이미지 + 영상 모두 로드 후 시작
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo || !loopVideo) return;

    // 전환 플래그
    let switched = false;

    // Pre-Switch 타이밍 (종료 몇 초 전에 전환할지)
    const PRE_SWITCH_TIME = 0.05;

    // 배경 이미지 프리로드
    function preloadImages() {
        return new Promise(function(resolve) {
            const images = [
                '../resource/background.jpg',
                '../resource/big_change.png',
                '../resource/big_2.png'
            ];
            let loaded = 0;

            images.forEach(function(src) {
                const img = new Image();
                img.onload = img.onerror = function() {
                    loaded++;
                    if (loaded === images.length) resolve();
                };
                img.src = src;
            });
        });
    }

    // 영상 로드 대기
    function waitForVideo(video) {
        return new Promise(function(resolve) {
            if (video.readyState >= 3) {
                resolve();
            } else {
                video.addEventListener('canplaythrough', resolve, { once: true });
            }
        });
    }

    // 영상 재생 시작
    function startPlayback() {
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});
        loopVideo.currentTime = 0;
        loopVideo.play().catch(function() {});
    }

    // Pre-Switch: A영상 종료 직전에 B로 전환
    mainVideo.addEventListener('timeupdate', function() {
        if (switched) return;
        if (!mainVideo.duration) return;

        const remaining = mainVideo.duration - mainVideo.currentTime;

        // 1초 전에 버튼 표시
        if (remaining <= 1 && naverBtn && !naverBtn.classList.contains('visible')) {
            naverBtn.classList.add('visible');
        }

        // 0.05초 전에 전환
        if (remaining <= PRE_SWITCH_TIME) {
            switched = true;
            loopVideo.currentTime = 0;
            mainVideo.style.visibility = 'hidden';
        }
    });

    // 초기화: 모든 리소스 로드 후 시퀀스 시작
    Promise.all([
        preloadImages(),
        waitForVideo(mainVideo),
        waitForVideo(loopVideo)
    ]).then(function() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        // 배경 페이드인 완료 후(0.5초) 영상 시작
        setTimeout(startPlayback, 500);
    });
})();
