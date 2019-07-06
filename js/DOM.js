



    // DOMDisplay uses the DOM to draw the program out
    function DOMDisplay(parent, level) {
        this.wrap = parent.appendChild(elt('div', 'game'));
        this.level = level;
        // Background is drawn only once
        this.wrap.appendChild(this.drawBackground());
        // The actorLayer is animated in the drawFrame() method
        this.actorLayer = null;
        this.drawFrame();
    }
    DOMDisplay.prototype.drawBackground = function() {
        var table = elt('table', 'background');
        table.style.width = this.level.width * scale + 'px';
        this.level.grid.forEach(function(row) {
            var rowElt = table.appendChild(elt('tr'));
            rowElt.style.height = scale + 'px';
            row.forEach(function(type) {
                rowElt.appendChild(elt('td', type));
            });
        });
        return table;
    };
    // Draw the actors
    DOMDisplay.prototype.drawActors = function() {
        var wrap = elt('div');
        this.level.actors.forEach(function(actor) {
            var rect = wrap.appendChild(elt('div', 'actor ' + actor.type));
            rect.style.width = actor.size.x * scale + 'px';
            rect.style.height = actor.size.y * scale + 'px';
            rect.style.left = actor.pos.x * scale + 'px';
            rect.style.top = actor.pos.y * scale + 'px';
        });
        return wrap;
    };
    // Redraw the actors
    DOMDisplay.prototype.drawFrame = function() {
        if (this.actorLayer)
            this.wrap.removeChild(this.actorLayer);
        this.actorLayer = this.wrap.appendChild(this.drawActors());
        // The status class is used to style the player based on
        // the state of the game (won or lost)
        this.wrap.className = 'game ' + (this.level.status || '');
        this.scrollPlayerIntoView();
    };
    // Make sure the player's always on screen
    DOMDisplay.prototype.scrollPlayerIntoView = function() {
            var width = this.wrap.clientWidth;
            var height = this.wrap.clientHeight;
            var margin = width / 3;
            // The viewport
            var left = this.wrap.scrollLeft,
                right = left + width;
            var top = this.wrap.scrollTop,
                bottom = top + height;
            // center makes use of the Vector methods defined earlier
            var player = this.level.player;
            var center = player.pos.plus(player.size.times(0.5))
                .times(scale);
            if (center.x < left + margin)
                this.wrap.scrollLeft = center.x - margin;
            else if (center.x > right - margin)
                this.wrap.scrollLeft = center.x + margin - width;
            if (center.y < top + margin)
                this.wrap.scrollTop = center.y - margin;
            else if (center.y > bottom - margin)
                this.wrap.scrollTop = center.y + margin - height;
        }
        // Clear the level
    DOMDisplay.prototype.clear = function() {
        this.wrap.parentNode.removeChild(this.wrap);
    };