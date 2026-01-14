// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// 배경 이미지 + 영상 모두 로드 후 시작
// A영상 종료 후 B영상으로 교체
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo || !loopVideo) return;

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

    // A영상 재생 시작
    function startPlayback() {
        // A영상만 보이게 + 재생
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});
    }

    // A영상 종료 1초 전에 버튼 표시
    mainVideo.addEventListener('timeupdate', function() {
        if (!mainVideo.duration) return;
        const remaining = mainVideo.duration - mainVideo.currentTime;

        if (remaining <= 1 && naverBtn && !naverBtn.classList.contains('visible')) {
            naverBtn.classList.add('visible');
        }
    });

    // A영상 종료 시 B영상으로 교체
    mainVideo.addEventListener('ended', function() {
        // A영상 숨김
        mainVideo.style.display = 'none';
        // B영상 즉시 보이기 + 재생 (페이드인 없음)
        loopVideo.style.opacity = '1';
        loopVideo.currentTime = 0;
        loopVideo.play().catch(function() {});
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

        // 배경 페이드인 완료 후(0.7초) 영상 시작
        setTimeout(startPlayback, 700);
    });
})();
