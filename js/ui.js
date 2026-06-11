class UI {
    constructor() {
        this.menuScreen = document.getElementById('menu-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.finalScoreEl = document.getElementById('final-score');
        this.bestScoreEl = document.getElementById('best-score');
        this.resultRankEl = document.getElementById('result-rank');
        this.resultStatsEl = document.getElementById('result-stats');
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

    getRank(score) {
        if (score >= 3000) return 'S';
        if (score >= 1500) return 'A';
        if (score >= 800) return 'B';
        if (score >= 300) return 'C';
        return 'D';
    }

    showGameOver(score, bestScore, kills, props, time) {
        this.finalScoreEl.textContent = score.toString();
        this.bestScoreEl.textContent = 'BEST: ' + bestScore;
        
        if (this.resultRankEl) {
            const rank = this.getRank(score);
            this.resultRankEl.textContent = rank;
            this.resultRankEl.style.animation = 'none';
            void this.resultRankEl.offsetWidth;
            this.resultRankEl.style.animation = 'rankGlitch 0.5s ease-out 0.1s both';
        }
        
        if (this.resultStatsEl) {
            this.resultStatsEl.innerHTML = 
                '<span>KILLS: ' + kills + '</span>' +
                '<span>ITEMS: ' + props + '</span>' +
                '<span>TIME: ' + time + 's</span>';
        }
        
        this.gameoverScreen.classList.remove('hidden');
    }

    drawHUD(ctx, player, gameTime) {
        const level = Math.floor(gameTime / 1800) + 1;
        
        // 顶部面板 - 终端边框
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, 464, 36);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(9, 9, 462, 34);
        
        // SCORE - 左侧
        ctx.fillStyle = '#00ff41';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SCORE:', 18, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(player.score.toString(), 18, 36);
        
        // LEVEL - 中间
        ctx.fillStyle = '#00ff41';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL:', 240, 20);
        ctx.fillStyle = '#39ff14';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('[' + level + ']', 240, 36);
        
        // LIFE - 右侧
        ctx.fillStyle = '#00ff41';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('LIFE:', 462, 20);
        
        const heartX = 408;
        for (let i = 0; i < player.lives; i++) {
            this.drawHeart(ctx, heartX + i * 16, 30);
        }
        
        // 护盾状态
        if (player.shield) {
            ctx.fillStyle = '#00ff41';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('>> SHIELD ACTIVE', 18, 52);
        }
        
        // 道具计时
        if (player.propTimer > 0) {
            const sec = Math.ceil(player.propTimer / 60);
            ctx.fillStyle = '#00ff41';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('>> ' + player.bulletType.toUpperCase() + ' [' + sec + 's]', 180, 52);
        }
        
        // Boss 血条
        var boss = window.gameInstance ? window.gameInstance.enemies.find(e => e.type === 'boss' && e.alive) : null;
        if (boss) {
            var barW = 320, barH = 4, barX = (480 - barW) / 2, barY = 56;
            var hpRatio = boss.hp / boss.maxHp;
            ctx.strokeStyle = '#00ff41';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.fillStyle = 'rgba(0, 255, 65, 0.2)';
            ctx.fillRect(barX + 1, barY + 1, barW - 2, barH - 2);
            ctx.fillStyle = '#00ff41';
            ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpRatio, barH - 2);
            ctx.fillStyle = '#00ff41';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('[ BOSS: ' + Math.round(hpRatio * 100) + '% ]', 240, barY + 14);
        } else {
            // 目标显示
            ctx.fillStyle = 'rgba(0, 255, 65, 0.4)';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            var nextBoss = window.gameInstance ? window.gameInstance.nextBossScore - (window.gameInstance.player?.score || 0) : 0;
            ctx.fillText('>> TARGET: ' + (nextBoss > 0 ? nextBoss : 0), 240, 66);
        }
    }

    drawHeart(ctx, x, y) {
        ctx.strokeStyle = '#ff6688';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 2);
        ctx.bezierCurveTo(x, y - 5, x - 3, y - 7, x - 5, y - 4);
        ctx.bezierCurveTo(x - 8, y - 1, x, y + 4, x, y + 4);
        ctx.bezierCurveTo(x, y + 4, x + 8, y - 1, x + 5, y - 4);
        ctx.bezierCurveTo(x + 3, y - 7, x, y - 5, x, y - 2);
        ctx.stroke();
    }
}