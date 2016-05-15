/*
 * ____            _ _         __  __           _       _
 * |  _ \  ___ _ __| (_)_ __   |  \/  | ___   __| | __ _| |___
 * | | | |/ _ \ '__| | | '_ \  | |\/| |/ _ \ / _` |/ _` | / __|
 * | |_| |  __/ |  | | | | | | | |  | | (_) | (_| | (_| | \__ \
 * |____/ \___|_|  |_|_|_| |_| |_|  |_|\___/ \__,_|\__,_|_|___/
 *
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     February 2016
 *
 * Copyright 2016 Derlin. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */

(function(){

    angular.module( 'derlin.modals', [] )
        .controller( 'DerlinController', function(){
        } )
        .factory( 'ModalService', DerlinModalService );

    /* *****************************************************************
     *  implementation
     * ****************************************************************/

    var currentModal = null;

    DerlinModalService.$inject = ['$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateCache'];
    function DerlinModalService( $document, $compile, $controller, $http, $rootScope, $q, $templateCache ){


        return {
            showModal: showModal,
            close    : closeCurrentModal
        };

        // ----------------------------------------------------

        function closeCurrentModal(){
            if( currentModal ){
                currentModal.scope.close();
            }
        }

        // ----------------------------------------------------

        //  Returns a promise which either resolves upon modal close, or fails
        // because the modal could not be rendered.
        function showModal( options ){

            var closeDeferred = $q.defer();

            closeCurrentModal(); // only one at a time

            //  Get the actual html of the template.
            getTemplate( options )
                .then( function( template ){
                    //  Create a new scope for the modal.
                    var modalScope = $rootScope.$new();
                    // add the custom inputs to the scope
                    modalScope.inputs = options.inputs || {};

                    if( !options.templateUrl ){
                        // make options available to the scope for the template to work
                        modalScope.positive = options.positive;
                        modalScope.negative = options.negative;
                        modalScope.title = options.title;
                        modalScope.text = options.text;
                    }

                    // create close function
                    modalScope.close = function( result ){
                        delay = options.framework == "bootstrap" ? 500 : 0;
                        window.setTimeout( function(){
                            $( document ).unbind( "keyup.dialog" );

                            //  Resolve the 'close' promise.
                            closeDeferred.resolve( {status: result, inputs: modalScope.inputs} );


                            //  We can now clean up the scope and remove the element from the DOM.
                            if(options.framework == "bootstrap"){
                                modalElement.modal('hide');
                            }
                            modalScope.$destroy();
                            modalElement.remove();

                            //  Unless we null out all of these objects we seem to suffer
                            //  from memory leaks, if anyone can explain why then I'd
                            //  be very interested to know.
                            closeDeferred = null;
                            modalElement = null;
                            modalScope = null;
                            currentModal = null;
                        }, delay );
                    };


                    //  Parse the modal HTML into a DOM element (in template form).
                    var modalElementTemplate = angular.element( template );

                    //  Compile then link the template element, building the actual element.
                    //  Set the $element on the inputs so that it can be injected if required.
                    var linkFn = $compile( modalElementTemplate );
                    var modalElement = linkFn( modalScope );
                    //inputs.$element = modalElement;


                    //  Create the controller, explicitly specifying the scope to use.
                    var modalController = $controller( 'DerlinController as ctrl', {$scope: modalScope} );

                    if( options.framework != "bootstrap" && options.cancelable ){
                        modalElement.click( function(){
                            modalScope.close();
                        } );

                        $( document ).bind( "keyup.dialog", function( e ){
                            if( e.which == 27 )
                                modalScope.close();
                        } );

                        modalElement.find( 'div' ).first().click( function( e ){
                            e.stopPropagation();
                        } );
                    }


                    //  Finally, append the modal to the dom.
                    if( options.appendElement ){
                        // append to custom append element
                        options.appendElement.append( modalElement );

                    }else{
                        // append to body when no custom append element is specified
                        $document.find( 'body' ).append( modalElement );
                    }

                    //  We now have a modal object...
                    currentModal = {
                        controller: modalController,
                        scope     : modalScope,
                        element   : modalElement
                    };

                    if( options.framework == "bootstrap" ){
                        var opt = options.cancelable ? {keyboard: true} : {keyboard: false, backdrop: "static"};
                        modalElement.modal( opt );

                    }else{
                        componentHandler.upgradeDom();
                    }

                }, function(){
                    // if the template failed
                    closeDeferred.reject();
                } ); // end getTemplate.then

            return closeDeferred.promise;

        }// end showModal


        // ----------------------------------------------------


        function getTemplate( options ){
            var deferred = $q.defer();
            if( !options.templateUrl ){

                var content = options.html || "";

                if( options.framework == "bootstrap" ){
                    html = '<div class="derlinModal modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content">' +
                        '<div class="modal-header"><button type="button" class="close" ng-click="close(false)" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                        '<h4 class="modal-title">{{title}}</h4></div><div class="derlinContent modal-body"><p ng-show="text">{{' +
                        ' text }}</p>' + content + ' </div>' +
                        '<div class="modal-footer"><button ng-show="negative" type="button" ng-click="close(false)" class="btn btn-default" ' +
                        'data-dismiss="modal">{{negative}}</button><button ng-show="positive" type="button" ng-click="close(true)" ' +
                        'class="btn btn-primary" data-dismiss="modal">{{positive}}</button></div></div></div></div>';
                }else if(options.framework == "mdl"){
                    html = '<div class="derlinModal mdl"><div class="mdl-card' +
                        ' mdl-shadow--16dp content"><h3 ng-show="title">{{title}}</h3><p class="derlinContent" ng-show="text">{{text}}</p>' + content + '<div' +
                        ' class="mdl-card__actions button-bar"><button ng-show="negative" ng-click="close(false)" ' +
                        'class="mdl-button mdl-js-button mdl-js-ripple-effect" id="negative">{{negative}}</button>' +
                        '<button ng-show="positive" ng-click="close(true)" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"' +
                        ' id="positive">{{positive}}</button></div></div></div>';
                }else{
                    html = '<div id="NoFrameworkDerlinModal"><div class="dm-modal">' +
                        '<div ng-click="close(false)"><span class="dm-close">X</span></div>' +
                        '<h2 class="dm-title">{{title}}</h2><div class="dm-content"><p ng-show="text">{{text}}</p>' +  content +
                        '</div><div class="dm-footer"><button ng-show="negative" type="button" ng-click="close(false)" class="dm-btn">{{negative}}</button>' +
                        '<button ng-show="positive" type="button" ng-click="close(true)" class="dm-btn">{{positive}}</button></div></div></div>';
                }
                deferred.resolve( html );

            }else{
                // check to see if the template has already been loaded
                var cachedTemplate = $templateCache.get( options.templateUrl );
                if( cachedTemplate !== undefined ){
                    deferred.resolve( cachedTemplate );
                }
                // if not, let's grab the template for the first time
                else{
                    $http( {method: 'GET', url: options.templateUrl, cache: true} )
                        .then( function( result ){
                            // save template into the cache and return the template
                            $templateCache.put( options.templateUrl, result.data );
                            deferred.resolve( result.data );
                        }, function( error ){
                            deferred.reject( error );
                        } );
                }
            }
            return deferred.promise;
        }


    } // end modalservice


}());