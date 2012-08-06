

/**
 * Manages the layout of entities
 */
pc.systems.Layout = pc.EntitySystem.extend('pc.systems.Layout',
    {},
    {
        margin: null,

        init: function(options)
        {
            this._super( [ 'layout' ] );
            this.margin = {};
            if (pc.checked(options) && pc.checked(options.margin))
            {
                this.margin.left = pc.checked(options.margin.left, 0);
                this.margin.right = pc.checked(options.margin.right, 0);
                this.margin.top = pc.checked(options.margin.top, 0);
                this.margin.bottom = pc.checked(options.margin.bottom, 0);
            } else
            {
                this.margin.left = 0;
                this.margin.right = 0;
                this.margin.top = 0;
                this.margin.bottom = 0;
            }
        },

        getAnchorLocation: function(horizontal, vertically)
        {
            if (horizontal === 'left')
            {
                if (vertically === 'top') return 'top-left';
                if (vertically === 'middle') return 'middle-left';
                if (vertically === 'bottom') return 'bottom-left';
            }

            if (horizontal === 'center')
            {
                if (vertically === 'top') return 'top-center';
                if (vertically === 'middle') return 'middle-center';
                if (vertically === 'bottom') return 'bottom-center';
            }

            if (horizontal === 'right')
            {
                if (vertically === 'top') return 'top-right';
                if (vertically === 'middle') return 'middle-right';
                if (vertically === 'bottom') return 'bottom-right';
            }
        },

        /**
         * Processes all the entities and lays them out according to the anchoring options
         * Typically this is called whenever a new entity with a layout component is added to the
         * system.
         */
        doLayout: function()
        {
            var layouts = new pc.HashList(); // a list for each of the anchors

            var next = this.entities.first;
            while (next)
            {
                var entity = next.obj;
                if (entity.active)
                {
                    var spatial = entity.getComponent('spatial');
                    var layout = entity.getComponent('layout');

                    // add entities to the layout sides; this just sorts them
                    var al = this.getAnchorLocation(layout.horizontal, layout.vertical);
                    layouts.add(al, next.obj);
                    //console.log(' adding: ' + next.obj.toString() + ' to anchor group: ' + al);
                }
                next = next.next();
            }

            // now go through all the anchor groups and lay things out
            var layoutKeys = layouts.hashtable.keys();
            for (var i=0; i < layoutKeys.length; i++)
            {
                var anchor = layoutKeys[i];
                var list = layouts.get(layoutKeys[i]);

                // if it's centered we need to know the height of all the entities being laid out
                // before we place the first item.

                var dim = this.getEntityDimensions(list);
                var cx = this.margin.left;
                var cy = this.margin.top;

                // set the starting position
                switch(anchor)
                {
                    case 'top-left':
                        break;
                    case 'middle-left':
                        cy += ( this.layer.getScreenRect().h / 2) - (dim.y/2);
                        break;
                    case 'bottom-left':
                        cy = this.layer.getScreenRect().h - dim.y - this.margin.bottom;
                        break;
                    case 'top-center':
                        cx += this.layer.getScreenRect().w / 2 - (dim.x/2);
                        break;
                    case 'middle-center':
                        cx += this.layer.getScreenRect().w / 2 - (dim.x/2);
                        cy +=( this.layer.getScreenRect().h / 2) - (dim.y/2);
                        break;
                    case 'bottom-center':
                        cx = this.layer.getScreenRect().w / 2 - (dim.x/2) - this.margin.bottom;
                        cy += this.layer.getScreenRect().h - dim.y;
                        break;
                    case 'top-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        break;
                    case 'middle-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        cy +=( this.layer.getScreenRect().h / 2) - (dim.y/2);
                        break;
                    case 'bottom-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        cy = this.layer.getScreenRect().h - dim.y - this.bottom.margin;
                        break;
                }

                // whilst this while loop below looks like it's handling all anchor types, keep in mind
                // each loop is only handling one type (since they are sorted/grouped above)
                var listNext = list.first;
                while (listNext)
                {
                    entity = listNext.obj;
                    spatial = entity.getComponent('spatial');
                    layout = entity.getComponent('layout');

                    cy += layout.margin.top;

                    switch(anchor)
                    {
                        case 'top-left':
                        case 'middle-left':
                        case 'bottom-left':
                            cx = layout.margin.left + this.margin.left;
                            break;
                        case 'top-center':
                        case 'middle-center':
                        case 'bottom-center':
                            cx = layout.margin.left + (this.layer.getScreenRect().w/2) - (spatial.dim.x/2);
                            break;
                        case 'top-right':
                        case 'middle-right':
                        case 'bottom-right':
                            cx = this.layer.getScreenRect().w - spatial.dim.x - layout.margin.right - this.margin.right;
                            break;
                    }

                    spatial.pos.x = cx;
                    spatial.pos.y = cy;

                    cy += spatial.dim.y + layout.margin.bottom;

                    listNext = listNext.next();
                }

            }
        },

        _entityDim: null,

        getEntityDimensions: function(list)
        {
            if (!this._entityDim)
                this._entityDim = new pc.Dim();

            this._entityDim.x = 0;
            this._entityDim.y = 0;

            var listNext = list.first;
            while (listNext)
            {
                var sp = listNext.obj.getComponent('spatial');
                var layout = listNext.obj.getComponent('layout');

                if (sp)
                {
                    this._entityDim.x += layout.margin.left + sp.dim.x + layout.margin.right;
                    this._entityDim.y += layout.margin.top + sp.dim.y + layout.margin.bottom;
                }

                listNext = listNext.next();
            }

            return this._entityDim;
        },

        onResize: function(width, height)
        {
            this.doLayout();
        },

        onEntityAdded: function(entity)
        {
            this._super();
            this.doLayout();
        },

        onEntityRemoved: function(entity)
        {
            this._super();
            this.doLayout();
        },

        onComponentAdded: function(entity, component)
        {
            this._super();
            this.doLayout();
        }



    });
















