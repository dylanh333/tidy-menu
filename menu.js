/* Example Menu System:
<ul class="Menu -horizontal">
    <!-- Methods: showMenu, hideMenu, hideChildMenus -->

    <li>
        <!-- Methods: activateMenuItem -->
        <a href="#">Menu item</a>
    </li>

    <li>
        <!-- Methods: activateMenuItem -->
        <a href="#">Another menu item</a>
    </li>

    <li class="-hasSubmenu">
        <!-- Methods: activateMenuItem -->

        <a href="#">Menu with submenu</a>
        <ul>
            <!-- Methods: showMenu, hideMenu, hideChildMenus -->
            ...
        </ul>
    </li>
</ul>
*/


(function(){
    var stack = [];
    var timeouts = [];

    function $(selector, context){
        if(
            !context
            || typeof context["querySelectorAll"] != "function"
        ) context = document;
        return context["querySelectorAll"](selector);
    }

    function forEach(collection, iterator){
        for(var key in Object.keys(collection)){
            iterator(collection[key]);
        }
    }

    /**
     * Gets the numerical key for an element, if it has one, otherwise it
     * assigns a new key and returns that.
     */
    var currElementKey = 1; //MUST start from 1
    function getElementKey(element){
        var key = Number(element.getAttribute("data-element-key"));
        if(!key){
            key = currElementKey++;
            element.setAttribute("data-element-key", key);
        }
        return key;
    }

    /**
     * showMenu - shows the menu specified by ul, and pushes it to the stack
     */
    function showMenu(ul){
        var key = getElementKey(ul);

        stack.push(ul);

        if(!ul.classList.contains("Menu"))
            ul.parentElement.classList.add("-active");

        ul.classList.add("-animating");
        ul.classList.add("-visible");
        clearTimeout(timeouts[key]);
        timeouts[key] = setTimeout(function(){
            delete timeouts[key];
            ul.classList.remove("-animating")
        }, 25);
    }


    /**
     * hideMenu - hides the menu at the top of the stack, and removes it from
     * the stack.
     */
    function hideMenu(){
        var ul = null;
        var key = NaN;

        if(stack.length == 0) return;
        else ul = stack.pop();
        key = getElementKey(ul);

        if(!ul.classList.contains("Menu"))
            ul.parentElement.classList.remove("-active");

        ul.classList.add("-animating");
        clearTimeout(timeouts[key]);
        timeouts[key] = setTimeout(function(){
            delete timeouts[key];
            ul.classList.remove("-visible");
            ul.classList.remove("-animating");
        }, 1000);
    }


    /**
     * hideChildMenus - hides all visible child menus under ul, or all visible
     * menus if ul is null;
     */
    function hideChildMenus(ul){
        var backup = stack.slice(0);
        while(stack.length > 0 && stack[stack.length-1] != ul){
            if(stack.length == 1) debugger;
            hideMenu();
        }
    }

    function hideAllMenus(){
        hideChildMenus(null);
    }

    function activateMenuItem(li){
        if(stack.length > 0 && stack[stack.length-1].parentElement == li)
            return;
        if(li.parentElement.classList.contains("-animating")) return;

        hideChildMenus(li.parentElement);
        if(stack.length == 0) showMenu(li.parentElement);

        if(li.classList.contains("-hasSubmenu")){
            //TODO: enforce that ul is a direct child of li
            var submenu = $("ul", li)[0];
            showMenu(submenu);
        }
    }

    window.addEventListener("load", function(){
        forEach($(".Menu li > a:first-child"), function(e){
            e.addEventListener("click", function(){
                activateMenuItem(this.parentElement);
            });
            e.addEventListener("mouseenter", function(){
                if(stack.length > 0) activateMenuItem(this.parentElement);
            });
        });

        //document.addEventListener("click", hideAllMenus);
        window.addEventListener("blur", hideAllMenus);
    });
})();
