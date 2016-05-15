/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     February 2016
 * @context  template example
 */
 (function () {

     /**
      * @ngdoc overview
      * @name app
      * @description

      *
      * @author Lucy Linder
      * @date   May 2016
      * @context  template example
      */
     angular.module('app',[ 'semantic.modals' ])
        .controller('MainCtrl', ctrl);

    // --------------------------

    function ctrl( $scope, ModalService ){

        var self = this;

        //##------------available methods

        self.modalInputsCancelable = modalInputsCancelable;
        self.modalBasicIcon = modalBasicIcon;
        self.modalHtmlInput = modalHtmlInput;
        self.modalHtmlInclude = modalHtmlInclude;
        self.modalTemplate = modalTemplate;

        function modalInputsCancelable(){
            ModalService.showModal( {
                title: "confirm",
                text: "are you sure ?",
                positive: "yep",
                negative: "cancel",
                cancelable : true

            } ).then( _log, _log );
        }

        function modalBasicIcon(){
            ModalService.showModal( {
                title   : "confirm",
                html    : "<p>are you absolutely sure ?</p><p>All its SLS will be deleted as well.</p>",
                positive: "proceed",
                negative: "cancel",
                icon    : "warning sign orange",
                basic   : true,
            }).then( function( result ){
                if(result.status){
                    console.log("deleting item...");
                }
            });
        }

        function modalHtmlInput(){
            ModalService.showModal( {
                title: "confirm",
                html: "are you sure you want to delete {{inputs.sensor.name}} ({{inputs.sensor.id}} ) ?",
                positive: "yes",
                basic: true,
                inputs     : {
                    sensor: {id: 3, name: "sensor-XXXX"}
                },
                cancelable : false

            } ).then( function( result ){
                console.log( result );
            }, function(){
                console.log( "error" );
            } );
        }

        function modalHtmlInclude(){
            ModalService.showModal( {
                title: "html include",
                htmlInclude: "partial/editModal_content.html",
                positive: "do it!",
                cancelable : false

            } ).then( function( result ){
                console.log( result );
            }, function(){
                console.log( "error" );
            } );
        }

        function modalTemplate(){
            ModalService.showModal( {
                title: "html include",
                templateUrl: "semanticModalTemplate.html",
                cancelable : false

            } ).then( function( result ){
                console.log( result );
            }, function(){
                console.log( "error" );
            } );
        }


        //##------------utils

        function _log( msg ){
            console.log( msg );
        }

    }
})();
