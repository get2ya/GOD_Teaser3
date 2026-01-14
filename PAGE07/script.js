// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// 배경 이미지 + 영상 모두 로드 후 시작
// A영상 종료 시점에 B영상이 처음부터 시작되도록 타이밍 맞춤
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo || !loopVideo) return;

    // B영상 시작 여부 플래그
    let loopStarted = false;

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
        // A영상 보이게 + 재생
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});
        // B영상은 보이게 해두지만 아직 재생 안 함
        loopVideo.style.opacity = '1';
    }

    // A영상 타임라인 체크
    mainVideo.addEventListener('timeupdate', function() {
        if (!mainVideo.duration || !loopVideo.duration) return;
        const remaining = mainVideo.duration - mainVideo.currentTime;

        // 버튼: 1초 전에 표시
        if (remaining <= 1 && naverBtn && !naverBtn.classList.contains('visible')) {
            naverBtn.classList.add('visible');
        }

        // B영상: A영상 종료 시점에 B가 처음부터 시작되도록 타이밍 맞춤
        // A 남은 시간 <= B 전체 길이일 때 B 재생 시작
        if (!loopStarted && remaining <= loopVideo.duration) {
            loopStarted = true;
            loopVideo.currentTime = 0;
            loopVideo.play().catch(function() {});
        }
    });

    // A영상 종료 시 B영상으로 전환
    mainVideo.addEventListener('ended', function() {
        // A영상만 숨기면 뒤에서 재생 중인 B영상이 보임
        mainVideo.style.display = 'none';
        // B영상 처음으로 리셋 (정확한 싱크)
        loopVideo.currentTime = 0;
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
