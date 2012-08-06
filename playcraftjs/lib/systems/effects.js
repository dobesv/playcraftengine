

pc.systems.Effects = pc.EntitySystem.extend('pc.systems.Effects',
    {
        FadeState:
        {
            NOT_STARTED: 0,
            DELAYING:1,
            FADING_IN:2,
            HOLDING:3,
            FADING_OUT:4,
            DONE: 5
        }
    },
    {
        init: function()
        {
            this._super( [ 'fade' ] );
        },

        processAll: function()
        {
            var next = this.entities.first;
            while (next)
            {
                var entity = next.obj;
                if (entity.active)
                {
                    var fade = entity.getComponent('fade');
                    if (fade)
                    {
                        var alpha = entity.getComponent('alpha');
                        if (!alpha)
                            alpha = entity.addComponent(pc.components.Alpha.create({}));

                        if (fade.state != this.Class.FadeState.DONE)
                        {
                            if (!this.fade(alpha, fade))
                                entity.removeComponent(fade);
                        }
                    }
                }

//                var floatAway = entity.getComponent('float');
//                if (float)
//                {
//                      this component could just modify physics over time?
//                }

                next = next.next();
            }
        },

        /**
         * Fades the target alpha component, returns false if done
         * @param alpha
         * @param fader
         */
        fade: function(alpha, fader)
        {
            var timeSinceStart = pc.device.now - fader.startTime;

            // do something about the current state, and change states if it's time.
            switch (fader.state)
            {
                case this.Class.FadeState.NOT_STARTED:
                    fader.startTime = pc.device.now;

                    if (fader.startDelay > 0)
                    {
                        fader.state = this.Class.FadeState.DELAYING;
                        fader.timeLimit = fader.startDelay;
                        alpha.setAlpha(0);

                    } else if (fader.fadeInTime > 0)
                    {
                        fader.state = this.Class.FadeState.FADING_IN;
                        fader.timeLimit = fader.fadeInTime;
                        // if we have a fade in element, then start alpha at 0
                        alpha.setAlpha(0);
                    }
                    else if (fader.holdTime > 0)
                    {
                        fader.state = this.Class.FadeState.HOLDING;
                        fader.timeLimit = fader.holdTime;
                    }
                    else if (fader.fadeOutTime > 0)
                    {
                        fader.state = this.Class.FadeState.FADING_OUT;
                        fader.timeLimit = fader.fadeOutTime;
                    }
                    break;

                case this.Class.FadeState.DELAYING:
                    // do nothing whilst holding
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.fadeInTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.FADING_IN;
                    }
                    break;
                case this.Class.FadeState.FADING_IN:
                    alpha.addAlpha((pc.device.elapsed * (100 / fader.timeLimit)) / 100);
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.holdTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.HOLDING;
                    }
                    break;
                case this.Class.FadeState.HOLDING:
                    // do nothing whilst holding
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.fadeOutTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.FADING_OUT;
                    }
                    break;
                case this.Class.FadeState.FADING_OUT:
                    // reverse the alpha fade
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.loopsSoFar++;

                        if (fader.loops > 1 || fader.loops == 0) // restart?
                        {
                            fader.startTime = pc.device.now;
                            fader.timeLimit = fader.fadeInTime;
                            fader.state = this.Class.FadeState.FADING_IN;
                            if (fader.timeLimit > 0) alpha.setAlpha(0);
                        }

                        if (fader.loopsSoFar >= fader.loops)
                        {
                           // all done, kill thyself
                           fader.state = this.Class.FadeState.DONE;
                           if (fader.timeLimit > 0) alpha.setAlpha(0);
                           return false;
                        }
                    } else
                        alpha.subAlpha((pc.device.elapsed * (100 / fader.timeLimit)) / 100);

                    break;
            }
            return true;
        }


    });
















