// 영상 제어 및 랙포커스 연출
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo) return;

    let loopReady = false;

    // 루프 영상 미리 준비 (재생 후 일시정지)
    function prepareLoopVideo() {
        loopVideo.play().then(function() {
            loopVideo.pause();
            loopVideo.currentTime = 0;
            loopReady = true;
        }).catch(function() {
            loopReady = true;
        });
    }

    function startSequence() {
        // Phase 1: 페이드인 + background/big_2 포커스
        bgGroup.classList.add('visible', 'phase1');

        // 루프 영상 미리 준비
        prepareLoopVideo();

        // Phase 2: big_change 포커스 (1.5초 후)
        setTimeout(function() {
            bgGroup.classList.remove('phase1');
            bgGroup.classList.add('phase2');
        }, 1500);

        // 영상 재생 (3초 후) + Phase 3: 전체 블러
        setTimeout(function() {
            bgGroup.classList.remove('phase2');
            bgGroup.classList.add('phase3');

            mainVideo.play().then(function() {
                mainVideo.classList.add('playing');
            }).catch(function(e) {
                mainVideo.classList.add('playing');
            });
        }, 3000);
    }

    // 메인 영상 끝나기 직전에 루프 영상 전환
    mainVideo.addEventListener('timeupdate', function() {
        // 영상 끝나기 0.05초 전에 전환
        if (mainVideo.duration - mainVideo.currentTime < 0.05 && !loopVideo.classList.contains('playing')) {
            // 루프 영상 먼저 보이게 하고
            loopVideo.classList.add('playing');
            loopVideo.play();
            // 메인 영상 숨기기
            mainVideo.classList.remove('playing');
        }
    });

    // 메인 영상 끝나면 네이버 버튼 표시
    mainVideo.addEventListener('ended', function() {
        if (naverBtn) {
            naverBtn.classList.add('visible');
        }
        mainVideo.style.display = 'none';
    });

    // 영상 프리로드 완료 후 시퀀스 시작
    if (mainVideo.readyState >= 3) {
        startSequence();
    } else {
        mainVideo.addEventListener('canplaythrough', startSequence, { once: true });
    }
})();
