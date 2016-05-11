/*
 *                                 _   _
 *  ___  ___ _ __ ___   __ _ _ __ | |_(_) ___   _ __ ___   ___   __| | __ _| |___
 *  / __|/ _ \ '_ ` _ \ / _` | '_ \| __| |/ __| | '_ ` _ \ / _ \ / _` |/ _` | / __|
 *  \__ \  __/ | | | | | (_| | | | | |_| | (__  | | | | | | (_) | (_| | (_| | \__ \
 *  |___/\___|_| |_| |_|\__,_|_| |_|\__|_|\___| |_| |_| |_|\___/ \__,_|\__,_|_|___/
 *
 *
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 *
 * Copyright 2015 EIA-FR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */

(function(){
    angular.module( 'semantic.modals', [] )
        .controller( 'BasicModalController', function(){
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

                        modalElement.modal( 'hide' );

                        //  Resolve the 'close' promise.
                        closeDeferred.resolve( {status: result, inputs: modalScope.inputs} );

                        closeDeferred = null;
                        modalElement = null;
                        modalScope = null;
                        currentModal = null;

                    };


                    //  Parse the modal HTML into a DOM element (in template form).
                    var modalElementTemplate = angular.element( template );

                    //  Compile then link the template element, building the actual element.
                    //  Set the $element on the inputs so that it can be injected if required.
                    var linkFn = $compile( modalElementTemplate );
                    var modalElement = linkFn( modalScope );
                    //inputs.$element = modalElement;


                    //  Create the controller, explicitly specifying the scope to use.
                    var modalController = $controller( 'BasicModalController as ctrl', {$scope: modalScope} );


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

                        console.log(options);
                    $( modalElement )  //
                        .modal( 'setting', 'closable', options.cancelable )  //
                        .modal( 'show' );

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

                if(options.htmlInclude){
                    content = "<div ng-include src=\"'" + options.htmlInclude + "'\"></div>";
                }

                var html;
                if( options.basic ){
                    html = '<div class="ui basic modal"> <i class="close icon" ng-click="close(false)"></i> <div class="header">{{title}}</div> <div class="image content"> <div class="description"> <p ng-show="text">{{text}}</p> ' + content + ' </div> </div> <div class="actions"> <div class="ui inverted buttons"> <div class="ui red basic inverted button" ng-click="close(false)" ng-show="negative"> <i class="remove icon"></i> {{negative}} </div> <div class="ui green basic inverted button" ng-click="close(true)" ng-show="positive"> <i class="checkmark icon"></i> {{positive}} </div>' +
                        ' </div> </div> </div>';

                }else{
                    html = '<div class="ui modal"> <i class="close icon"></i> <div class="header">' +
                        ' {{title}}' +
                        ' </div>' +
                        ' <div class="image content"> <div class="description"> <p ng-show="text">{{text}}</p>' + content + ' </div> </div> <div class="actions"> <div class="ui black deny button" ng-click="close(false)" ng-show="negative"> {{negative}} </div> <div class="ui positive right labeled icon button" ng-click="close(true)" ng-show="positive"> {{positive}} <i class="checkmark icon"></i> </div> </div> </div>';
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