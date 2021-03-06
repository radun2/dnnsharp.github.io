'use strict';

(function () {
    //EVENTS
    $('#search-input').on('click', function (e) {
        $('#results-container').show();
        event.stopPropagation();
        $(document).on('click.outsideSearch', function (event) {
            event.stopPropagation();
            var container = $("#results-container");

            //check if the clicked area is dropDown or not
            if (container.has(event.target).length === 0) {
                $('#results-container').hide();
                $(document).off('click.outsideSearch');
            }
        });
    });
    //END EVENTS

    // DECLARE FUNCTIONS
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function expandTreeToElement(element) {
        if (element.length) {
            while (!element.parent().hasClass('tree') && !element.is('body')) {
                element = element.parent();
                if (element.hasClass('parent_li')) {
                    element.find(' > span > i').addClass('fa-minus-circle').removeClass('fa-plus-circle');
                    element.find(' > ul > li').show();
                    element.find(' > span ').addClass('tree-current-item');
                }
            }
        }
    }

    function parsePathForSearchResults(path) {
        const replaceDictionary = {
            "/": " -> ",
            "-": " ",
            ".html": "",
            "_": " "
        }
        return path.replace(/\/|-|_|.html/gi, function (matched) {
            return replaceDictionary[matched]
        });
    }

    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    function renderResults(searchResults) {
        const resultsContainer = $('#results-container');
        resultsContainer.empty();

        if (!searchResults.length) {
            resultsContainer.text('No Results have been found');
            return;
        }

        const searchTemplate = '<li>' +
            '<a class="list-group-item list-group-item-action text-left"' +
            'href="{url}">' +
            '<span class="search-result-title">{title}</span>' +
            '<br>' +
            '<span class="search-result-path">{path}</span>' +
            '</a>' +
            '</li>';

        $.each(searchResults, function (index, result) {
            const templateCompileRegex = /({url}|{title}|{path})/g;
            const templateReplaceDictionary = {
                '{url}': result.Url,
                // github adds a "| Title of the site" after every title page and we need to get rid of it
                '{title}': result.Title.split('|')[0],
                '{path}': toTitleCase(parsePathForSearchResults(result.Url.replace('https://docs.dnnsharp.com/', '')))
            }

            const compiledTemplateForElement = searchTemplate.replace(templateCompileRegex, function (matched) {
                return templateReplaceDictionary[matched];
            });

            resultsContainer.append(compiledTemplateForElement);
        });
    }
    //END DECLARE FUNCTIONS

    // Search Setup

    var debouncedSearch = debounce(function (searchTerms) {
        const searchApiUrl = '//dnnsharpdocsservices.apps.plantanapp.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=search-docs' +
            '&query=' + searchTerms +
            '&resultsnumber=' + 10;

        $('#results-container').empty().append('<i class="fas fa-sync fa-spin"></i>');

        $.ajax({
            url: searchApiUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            success: function (response) {
                renderResults(JSON.parse(response));
            }
        });

    }, 300);

    $('#search-input').on('keyup', function (event) {
        debouncedSearch(event.target.value);
    });

    // end Searchboost Setup

    // inverts the state of toggle menu for mobile and desktop 
    $(".menu-toggle").click(function (e) {
        e.preventDefault();
        window.matchMedia("(min-width: 768px)").matches ? $("#wrapper").toggleClass("toggled") : $("#wrapper").toggleClass("mobile-untoggled");
    });

    // expand the tree to current location
    if (location.pathname !== '/' && location.pathname !== '/index.html') {
        let element = $("a[href='" + location.pathname + "']");
        element && expandTreeToElement(element);
        element.parent('span').addClass('tree-current-item');
        element[0].scrollIntoView({
            block: "center"
        });
    }

})();