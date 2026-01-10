// 영상 테스트 페이지
(function() {
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const mainInfo = document.getElementById('main-info');
    const loopInfo = document.getElementById('loop-info');

    // 메인 영상 컨트롤
    document.getElementById('main-play').addEventListener('click', function() {
        mainVideo.play();
    });

    document.getElementById('main-pause').addEventListener('click', function() {
        mainVideo.pause();
    });

    document.getElementById('main-stop').addEventListener('click', function() {
        mainVideo.pause();
        mainVideo.currentTime = 0;
    });

    document.getElementById('main-restart').addEventListener('click', function() {
        mainVideo.currentTime = 0;
        mainVideo.play();
    });

    // 루프 영상 컨트롤
    document.getElementById('loop-play').addEventListener('click', function() {
        loopVideo.play();
    });

    document.getElementById('loop-pause').addEventListener('click', function() {
        loopVideo.pause();
    });

    document.getElementById('loop-stop').addEventListener('click', function() {
        loopVideo.pause();
        loopVideo.currentTime = 0;
    });

    document.getElementById('loop-restart').addEventListener('click', function() {
        loopVideo.currentTime = 0;
        loopVideo.play();
    });

    // 시간 정보 업데이트
    function updateInfo() {
        if (mainVideo.duration) {
            mainInfo.textContent = '시간: ' + mainVideo.currentTime.toFixed(2) + 's / ' + mainVideo.duration.toFixed(2) + 's';
        }
        if (loopVideo.duration) {
            loopInfo.textContent = '시간: ' + loopVideo.currentTime.toFixed(2) + 's / ' + loopVideo.duration.toFixed(2) + 's';
        }
        requestAnimationFrame(updateInfo);
    }

    // 둘 다 자동 재생
    function autoPlayVideos() {
        mainVideo.play();
        loopVideo.play();
    }

    if (mainVideo.readyState >= 3 && loopVideo.readyState >= 3) {
        autoPlayVideos();
    } else {
        let mainReady = mainVideo.readyState >= 3;
        let loopReady = loopVideo.readyState >= 3;

        mainVideo.addEventListener('canplaythrough', function() {
            mainReady = true;
            if (loopReady) autoPlayVideos();
        }, { once: true });

        loopVideo.addEventListener('canplaythrough', function() {
            loopReady = true;
            if (mainReady) autoPlayVideos();
        }, { once: true });
    }

    // 시간 정보 업데이트 시작
    requestAnimationFrame(updateInfo);
})();
