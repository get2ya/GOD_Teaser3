// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// 배경 이미지 + 영상 모두 로드 후 시작
// A영상 종료 시점에 B영상이 처음부터 시작되도록 타이밍 맞춤
// requestAnimationFrame으로 정밀 타이밍 (약 16ms 간격)
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo || !loopVideo) return;

    // 플래그
    let loopStarted = false;
    let buttonShown = false;
    let animFrameId = null;

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

    // B영상 시작 타이밍 (A영상 종료 몇 초 전)
    const B_START_BEFORE = 1; // 1초 전

    // 정밀 타이밍 체크 (requestAnimationFrame)
    function checkTiming() {
        if (!mainVideo.duration || !loopVideo.duration) {
            animFrameId = requestAnimationFrame(checkTiming);
            return;
        }

        const remaining = mainVideo.duration - mainVideo.currentTime;

        // 버튼: 1초 전에 표시
        if (!buttonShown && remaining <= 1 && naverBtn) {
            buttonShown = true;
            naverBtn.classList.add('visible');
        }

        // B영상: A영상 종료 1초 전에 시작, B영상 8초(duration-1) 위치부터
        if (!loopStarted && remaining <= B_START_BEFORE) {
            loopStarted = true;
            // B영상을 끝에서 1초 전 위치(8초)부터 시작
            loopVideo.currentTime = loopVideo.duration - B_START_BEFORE;
            loopVideo.play().catch(function() {});
        }

        // A영상이 아직 재생 중이면 계속 체크
        if (!mainVideo.ended) {
            animFrameId = requestAnimationFrame(checkTiming);
        }
    }

    // A영상 재생 시작
    function startPlayback() {
        // A영상 보이게 + 재생
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});
        // B영상은 보이게 해두지만 아직 재생 안 함
        loopVideo.style.opacity = '1';
        // 정밀 타이밍 체크 시작
        animFrameId = requestAnimationFrame(checkTiming);
    }

    // A영상 종료 시 B영상으로 전환
    mainVideo.addEventListener('ended', function() {
        // 타이밍 체크 중지
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }
        // A영상만 숨기면 뒤에서 재생 중인 B영상이 보임
        mainVideo.style.display = 'none';
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
