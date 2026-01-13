// Valen 애니메이션 페이지
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const valenVideo = document.getElementById('valen-video');
    const bgGroup = document.querySelector('.background-group');

    if (!valenVideo) return;

    // 영상 종료 시 네이버 버튼 표시
    valenVideo.addEventListener('ended', function() {
        if (naverBtn) {
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
        valenVideo.classList.add('visible');
        valenVideo.play().catch(function() {});
    }

    // 영상이 이미 로드되었는지 확인
    if (valenVideo.readyState >= 3) {
        startSequence();
    } else {
        valenVideo.addEventListener('canplaythrough', startSequence, { once: true });
    }
})();
