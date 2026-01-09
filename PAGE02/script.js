// 영상 제어 및 랙포커스 연출
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo) return;

    function startSequence() {
        // Phase 1: 페이드인 + background/big_2 포커스
        bgGroup.classList.add('visible', 'phase1');

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
                // 메인 영상 재생 시작하면 루프 영상도 뒤에서 미리 재생
                loopVideo.play();
            }).catch(function() {
                mainVideo.classList.add('playing');
                loopVideo.play();
            });
        }, 3000);
    }

    // 메인 영상 끝나면 opacity 스위칭 (Gemini 방식)
    mainVideo.addEventListener('ended', function() {
        // requestAnimationFrame으로 정확한 타이밍에 전환
        requestAnimationFrame(function() {
            loopVideo.classList.add('playing');  // 루프 보이기
            mainVideo.classList.remove('playing');  // 메인 숨기기

            if (naverBtn) {
                naverBtn.classList.add('visible');
            }

            // 전환 후 메인 영상 제거하여 메모리 절약
            setTimeout(function() {
                mainVideo.style.display = 'none';
            }, 500);
        });
    });

    // 영상 프리로드 완료 후 시퀀스 시작
    if (mainVideo.readyState >= 3) {
        startSequence();
    } else {
        mainVideo.addEventListener('canplaythrough', startSequence, { once: true });
    }
})();
