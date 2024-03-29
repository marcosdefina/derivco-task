const bpc = {};
function getParameterByName(e) {
    const t = RegExp(`[?&]${e}=([^&]*)`).exec(window.location.search);
    return t && decodeURIComponent(t[1].replace(/\+/g, " "))
}
function getMajorPixiVersion(e) {
    let t = 5;
    return "v" === e.substr(0, 1) && (t = parseInt(e.substr(1, 1), 10)),
    t
}
jQuery(document).ready(e=>{
    window.onpopstate = function(t) {
        bpc.pixiVersionString = getParameterByName("v") || "dev",
        bpc.generateIFrameContent(),
        e(".select-group .select li.selected").removeClass("selected");
        const i = e(`.select-group .select li[data-val="${bpc.pixiVersionString}"]`);
        i.addClass("selected"),
        e(".select-group .select .current").text(i.text()),
        e(".main-content").animate({
            scrollTop: 0
        }, 200)
    }
    ,
    bpc.allowedVersions = [5],
    bpc.pixiVersionString = getParameterByName("v") || "dev",
    bpc.majorPixiVersion = getMajorPixiVersion(bpc.pixiVersionString),
    bpc.exampleUrl = "",
    bpc.exampleFilename = "",
    bpc.exampleTitle = "",
    bpc.exampleSourceCode = "",
    bpc.exampleRequiredPlugins = [],
    bpc.exampleValidVersions = [],
    bpc.editorOptions = {
        mode: "javascript",
        lineNumbers: !0,
        styleActiveLine: !0,
        matchBrackets: !0,
        viewportMargin: 1 / 0,
        lineWrapping: !0
    },
    bpc.clickType = "click",
    bpc.animTime = .15,
    bpc.resize = function() {}
    ,
    bpc.scriptsToLoad = ["https://cdnjs.cloudflare.com/ajax/libs/gsap/2.0.2/TweenMax.min.js"],
    bpc.scriptsLoaded = 0,
    bpc.loadScriptsAsync = function() {
        for (let t = 0; t < bpc.scriptsToLoad.length; t++)
            e.ajax({
                url: bpc.scriptsToLoad[t],
                dataType: "script",
                cache: !0,
                async: !0,
                success: bpc.fileLoaded
            });
        0 === bpc.scriptsToLoad.length && bpc.loadComplete()
    }
    ,
    bpc.fileLoaded = function() {
        bpc.scriptsLoaded++,
        bpc.scriptsLoaded === bpc.scriptsToLoad.length && bpc.loadComplete()
    }
    ,
    bpc.loadComplete = function() {
        e.getJSON("examples/manifest.json", t=>{
            const i = Object.keys(t);
            for (let a = 0; a < i.length; a++) {
                let n = `<span class="section" data-section="${i[a]}">${i[a]}</span><ul data-section="${i[a]}">`;
                const s = t[i[a]];
                for (let e = 0; e < s.length; e++) {
                    const t = void 0 !== s[e].plugins ? s[e].plugins.join(",") : ""
                      , i = void 0 !== s[e].validVersions ? s[e].validVersions.join(",") : "";
                    n += `<li data-src="${s[e].entry}" data-plugins="${t}" data-validVersions="${i}">${s[e].title}</li>`
                }
                n += "</ul>",
                e(".main-menu").append(n)
            }
            bpc.initNav()
        }
        ),
        e.getJSON("https://api.github.com/repos/pixijs/pixi.js/git/refs/tags", t=>{
            let i = [];
            bpc.allowedVersions.forEach(e=>{
                let a = t.filter(t=>0 === t.ref.indexOf(`refs/tags/v${e}`));
                a.length > 5 && (a = a.slice(-5)),
                i = i.concat(a)
            }
            ),
            i = i.map(e=>e.ref.replace("refs/tags/", ""));
            for (let t = 0; t < i.length; t++)
                e(".select-group .select ul").append(`<li data-val="${i[t]}">${i[t]}</li>`);
            e.getJSON("https://api.github.com/repos/pixijs/pixi.js/git/refs/heads", t=>{
                t = t.filter(e=>0 === e.ref.indexOf("refs/heads/next")).map(e=>e.ref.replace("refs/heads/", ""));
                for (let i = 0; i < t.length; i++)
                    e(".select-group .select ul").append(`<li data-val="${t[i]}">${t[i]}</li>`);
                const i = e(`.select-group .select li[data-val="${bpc.pixiVersionString}"]`);
                i.addClass("selected"),
                e(".select-group .select .current").text(i.text())
            }
            )
        }
        )
    }
    ,
    bpc.initNav = function() {
        if (e(".main-menu .section").on(bpc.clickType, function() {
            e(this).next("ul").slideToggle(250),
            e(this).toggleClass("open")
        }),
        e(".main-menu li").on(bpc.clickType, function() {
            if (!e(this).hasClass("selected")) {
                e(".main-menu li.selected").removeClass("selected"),
                e(this).addClass("selected"),
                bpc.closeMobileNav();
                const t = `/${e(this).parent().attr("data-section")}/${e(this).attr("data-src")}`;
                bpc.exampleTitle = e(this).text(),
                window.location.hash = t,
                document.title = `${bpc.exampleTitle} - PixiJS Examples`,
                ga("set", {
                    page: t,
                    title: bpc.exampleTitle
                }),
                ga("send", "pageview"),
                bpc.exampleUrl = `examples/js/${e(this).parent().attr("data-section")}/${e(this).attr("data-src")}`,
                bpc.exampleFilename = e(this).attr("data-src");
                const i = e(this).attr("data-plugins");
                bpc.exampleRequiredPlugins = "" === i ? [] : i.split(",");
                const a = e(this).attr("data-validVersions");
                bpc.exampleValidVersions = "" === a ? [5] : a.split(",").map(e=>parseInt(e, 10)),
                e.ajax({
                    url: `examples/js/${e(this).parent().attr("data-section")}/${e(this).attr("data-src")}`,
                    dataType: "text",
                    success(e) {
                        bpc.exampleSourceCode = e,
                        bpc.generateIFrameContent()
                    }
                })
            }
        }),
        bpc.generateIFrameContent = function() {
            const t = document.querySelectorAll("iframe");
            for (let e = 0; e < t.length; e++)
                t[e].parentNode.removeChild(t[e]);
            e("#example").html('<iframe id="preview" src="blank.html"></iframe>'),
            e(".CodeMirror").remove(),
            e(".main-content #code").html(bpc.exampleSourceCode);
            let i = ""
              , a = "<!DOCTYPE html><html><head><style>";
            a += "body,html{margin:0px;height:100%;overflow:hidden;}canvas{width:100%;height:100%;}",
            a += "</style></head><body>",
            a += '<script src="https://code.jquery.com/jquery-3.3.1.min.js"><\/script>',
            a += `<script src="${i = "local" === bpc.pixiVersionString ? "dist/pixi.js" : `https://d157l7jdn8e5sf.cloudfront.net/${bpc.pixiVersionString}/pixi.js`}"><\/script>`;
            for (let e = 0; e < bpc.exampleRequiredPlugins.length; e++)
                a += `<script src="pixi-plugins/${bpc.exampleRequiredPlugins[e]}.js"><\/script>`;
            bpc.editor = CodeMirror.fromTextArea(document.getElementById("code"), bpc.editorOptions),
            bpc.exampleRequiredPlugins.length ? e("#code-header").text(`Example Code (plugins used: ${bpc.exampleRequiredPlugins.toString()})`) : e("#code-header").text("Example Code"),
            !bpc.exampleValidVersions.length || bpc.exampleValidVersions.indexOf(bpc.majorPixiVersion) > -1 ? (e("#example-title").html(bpc.exampleTitle),
            a += `<script>window.onload = function(){${bpc.exampleSourceCode}}<\/script></body></html>`,
            e(".example-frame").show()) : (e("#example-title").html(`${bpc.exampleTitle}<br><br><br><br><br><br><br>` + "The selected version of PixiJS does not work with this example.<br><br>" + `Selected version: v${bpc.majorPixiVersion}<br><br>` + `Required version: v${bpc.exampleValidVersions.toString()}<br><br><br><br><br>`),
            e(".example-frame").hide());
            const n = document.getElementById("preview")
              , s = n.contentDocument || n.contentWindow.document;
            s.open(),
            s.write(a),
            s.close()
        }
        ,
        bpc.openMobileNav = function() {
            TweenMax.to("#line1", bpc.animTime, {
                y: 0,
                ease: Linear.easeNone
            }),
            TweenMax.to("#line2", 0, {
                alpha: 0,
                ease: Linear.easeNone,
                delay: bpc.animTime
            }),
            TweenMax.to("#line3", bpc.animTime, {
                y: 0,
                ease: Linear.easeNone
            }),
            TweenMax.to("#line1", bpc.animTime, {
                rotation: 45,
                ease: Quart.easeOut,
                delay: bpc.animTime
            }),
            TweenMax.to("#line3", bpc.animTime, {
                rotation: -45,
                ease: Quart.easeOut,
                delay: bpc.animTime
            }),
            e(".main-nav").addClass("mobile-open")
        }
        ,
        bpc.closeMobileNav = function() {
            TweenMax.to("#line1", bpc.animTime, {
                rotation: 0,
                ease: Linear.easeNone,
                delay: 0
            }),
            TweenMax.to("#line3", bpc.animTime, {
                rotation: 0,
                ease: Linear.easeNone,
                delay: 0
            }),
            TweenMax.to("#line2", 0, {
                alpha: 1,
                ease: Quart.easeOut,
                delay: bpc.animTime
            }),
            TweenMax.to("#line1", bpc.animTime, {
                y: -8,
                ease: Quart.easeOut,
                delay: bpc.animTime
            }),
            TweenMax.to("#line3", bpc.animTime, {
                y: 8,
                ease: Quart.easeOut,
                delay: bpc.animTime
            }),
            e(".main-nav").removeClass("mobile-open")
        }
        ,
        bpc.updateMenu = function() {
            e(".main-nav .main-menu ul li").each(function() {
                const t = e(this).attr("data-validVersions");
                -1 === ("" === t ? [5] : t.split(",").map(e=>parseInt(e, 10))).indexOf(bpc.majorPixiVersion) ? e(this).addClass("invalid") : e(this).removeClass("invalid")
            })
        }
        ,
        bpc.updateMenu(),
        e(".main-header .hamburger").on(bpc.clickType, t=>(t.preventDefault(),
        e(".main-nav").hasClass("mobile-open") ? bpc.closeMobileNav() : bpc.openMobileNav(),
        !1)),
        "" !== window.location.hash) {
            const t = window.location.hash.replace("#/", "").split("/");
            t.length > 1 && e(`.main-menu .section[data-section="${t[0]}"]`).length > 0 && (e(`.main-menu .section[data-section="${t[0]}"]`).trigger(bpc.clickType),
            e(`.main-menu .section[data-section="${t[0]}"]`).next().find(`li[data-src="${t[1]}"]`).length > 0 && e(`.main-menu .section[data-section="${t[0]}"]`).next().find(`li[data-src="${t[1]}"]`).trigger(bpc.clickType))
        } else
            e(".main-menu .section").eq(0).trigger(bpc.clickType),
            e(".main-menu li").eq(0).trigger(bpc.clickType);
        e(".select-group").on(bpc.clickType, function() {
            e(this).find(".select").hasClass("open") ? (e(this).find(".select").removeClass("open"),
            e(this).find("ul").slideUp(150)) : (e(this).find(".select").addClass("open"),
            e(this).find("ul").slideDown(150))
        }),
        e(".select-group .select").on(bpc.clickType, "li", function() {
            e(this).hasClass("selected") || (e(".select-group .select li.selected").removeClass("selected"),
            e(this).addClass("selected"),
            e(".select-group .select .current").text(e(this).text()),
            bpc.pixiVersionString = e(this).attr("data-val"),
            bpc.majorPixiVersion = getMajorPixiVersion(bpc.pixiVersionString),
            window.history.pushState(bpc.pixiVersionString, null, `?v=${bpc.pixiVersionString}${window.location.hash}`),
            bpc.updateMenu(),
            bpc.generateIFrameContent(),
            e(".main-content").animate({
                scrollTop: 0
            }, 200))
        }),
        e(".footer .download").on(bpc.clickType, ()=>{
            bpc.SaveToDisk(bpc.exampleUrl, bpc.exampleFilename)
        }
        ),
        e(".reload").on(bpc.clickType, ()=>{
            bpc.exampleSourceCode = bpc.editor.getValue(),
            bpc.generateIFrameContent()
        }
        )
    }
    ,
    bpc.SaveToDisk = function(e, t) {
        if (window.ActiveXObject) {
            if (window.ActiveXObject && document.execCommand) {
                const i = window.open(e, "_blank");
                i.document.close(),
                i.document.execCommand("SaveAs", !0, t || e),
                i.close()
            }
        } else {
            const i = document.createElement("a");
            i.href = e,
            i.target = "_blank",
            i.download = t || "unknown";
            const a = new MouseEvent("click",{
                view: window,
                bubbles: !0,
                cancelable: !1
            });
            i.dispatchEvent(a),
            (window.URL || window.webkitURL).revokeObjectURL(i.href)
        }
    }
    ,
    bpc.init = function() {
        e(window).resize(bpc.resize),
        bpc.loadScriptsAsync()
    }
    ,
    bpc.init()
}
);
