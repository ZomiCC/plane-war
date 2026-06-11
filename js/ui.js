// UI 管理器
class UI {
    constructor() {
        this.menuScreen = document.getElementById('menu-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.finalScoreEl = document.getElementById('final-score');
        this.bestScoreEl = document.getElementById('best-score');
    }

    showMenu() {
        this.menuScreen.classList.remove('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
    }

    hideAll() {
        this.menuScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
    }

    showPause() { this.pauseScreen.classList.remove('hidden'); }
    hidePause() { this.pauseScreen.classList.add('hidden'); }

    showGameOver(score, bestScore) {
        this.finalScoreEl.textContent = '得分: ' + score;
        this.bestScoreEl.textContent = '最高分: ' + bestScore;
        this.gameoverScreen.classList.remove('hidden');
    }

    drawHUD(ctx, player, gameTime) {
        // 半透明顶部面板背景
        const panelGrad = ctx.createLinearGradient(0, 0, 0, 60);
        panelGrad.addColorStop(0, 'rgba(0, 0, 20, 0.5)');
        panelGrad.addColorStop(1, 'rgba(0, 0, 20, 0)');
        ctx.fillStyle = panelGrad;
        ctx.fillRect(0, 0, 480, 60);

        // 得分
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(150, 180, 200, 0.6)';
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.fillText('SCORE', 14, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Microsoft YaHei", sans-serif';
        ctx.shadowColor = 'rgba(0, 180, 255, 0.3)';
        ctx.shadowBlur = 6;
        ctx.fillText(player.score.toString(), 14, 38);
        ctx.shadowBlur = 0;

        // 生命值（心形图标）
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(150, 180, 200, 0.6)';
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.fillText('LIFE', 480 - 14, 18);
        for (let i = 0; i < player.lives; i++) {
            this.drawMiniHeart(ctx, 480 - 18 - i * 22, 28);
        }

        // 等级
        const level = Math.floor(gameTime / 1800) + 1;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(150, 180, 200, 0.6)';
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.fillText('LV', 240, 18);
        ctx.fillStyle = '#88bbdd';
        ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
        ctx.fillText(level.toString(), 240, 36);

        // 护盾指示
        let statusY = 56;
        if (player.shield) {
            ctx.fillStyle = '#00ffc8';
            ctx.font = '12px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'left';
            ctx.shadowColor = '#00ffc8';
            ctx.shadowBlur = 4;
            ctx.fillText('SHIELD', 14, statusY);
            ctx.shadowBlur = 0;
            statusY += 16;
        }

        // 道具时间
        if (player.propTimer > 0) {
            const sec = Math.ceil(player.propTimer / 60);
            ctx.fillStyle = '#00ffaa';
            ctx.font = '12px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'left';
            ctx.shadowColor = '#00ffaa';
            ctx.shadowBlur = 4;
            ctx.fillText(player.bulletType === 'double' ? 'DOUBLE ' + sec + 's' : 'POWER ' + sec + 's', 14, statusY);
            ctx.shadowBlur = 0;
        }
    }

    drawMiniHeart(ctx, x, y) {
        ctx.save();
        const grad = ctx.createRadialGradient(x, y + 5, 0, x, y + 5, 8);
        grad.addColorStop(0, '#ff6688');
        grad.addColorStop(1, '#cc2244');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#ff4466';
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 3);
        ctx.bezierCurveTo(x, y, x - 4, y - 3, x - 7, y + 1);
        ctx.bezierCurveTo(x - 11, y + 6, x, y + 13, x, y + 13);
        ctx.bezierCurveTo(x, y + 13, x + 11, y + 6, x + 7, y + 1);
        ctx.bezierCurveTo(x + 4, y - 3, x, y, x, y + 3);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
