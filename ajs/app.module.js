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
    angular.module('app', ['semantic.modals'])
        .directive("highlight", highlightDynamic)
        .directive('modalExample', createExample)
        .filter('stringify', function(){ return stringify; })
        .controller('MainCtrl', ctrl);

    // --------------------------

    function stringify(obj){
        return obj ? JSON.stringify(obj, null, '   ').replace(/"([^"]*)":/g, '$1:') : "";
    }

    function highlightDynamic(){
        return {
             scope: {
               watch: "="
             },
             link: function(scope, element) {
                 scope.$watchCollection('watch', function(newValue){
                    if(!newValue) return;
                     var $div = $('<div><pre><code data-language="javascript">' +
                        stringify(newValue, null, '   ') + '</code></pre></div>');
                     Rainbow.color($div[0], function(result) {
                         element.html($div.html());
                     });
                 });
             }
         }
    }

    function createExample($compile, $templateRequest, ModalService){
        return {
             templateUrl: 'example-content.html',
             scope: {
               options: "<"
             },
             link: function(scope, element) {
                scope.try = function(){
                    ModalService.showModal(scope.options
                    ).then(function (result) {
                         scope.result = result;
                    }, function (error) {
                         scope.result = error;
                    });
                };

             }
         }
    }

    // --------------------------


    function ctrl($scope, $timeout, ModalService) {

        var self = this;

        self.content = {
            isHtml: false,
            text: "Are you sure ?",
            html: "Are you ok {{inputs.name}} ?"
        };

        self.freeOpts = {
            title: "modal",
            positive: "ok",
            negative: "cancel",
            basic: true,
            icon: "warning sign orange",
            text: self.content.text,
            inputs: {
                name: "Hank",
                id: 3
            }
        };

        // highlight
        $timeout(Rainbow.color, 500);

        //##------------available methods

        self.freeModal = freeModal;

        self.testIssue =
        function(){
            ModalService.showModal({
                templateId: 'hello',
                templateUrl: 'partial/confirmModal.html'
            }).then(function (result) {
              console.log("modalBasicIcon closed. Result=" + result);
          }, function (error) {
              console.log(error);
          });
        };

        $scope.$watch('ctrl.content.isHtml', function (nw, old) {

            if (nw != old) {
                var key = nw ? ['html', 'text'] : ['text', 'html'];
                self.freeOpts[key[0]] = self.content[key[0]];
                delete self.freeOpts[key[1]];
            }

            for (var key in self.freeOpts) {
                if (self.freeOpts[key] == "") delete self.freeOpts[key];
            }
        });

        $scope.$watch('ctrl.freeOpts', function (nw, old) {
            for (var key in self.freeOpts) {
                if (self.freeOpts[key] == "") delete self.freeOpts[key];
            }
            $timeout(Rainbow.color, 100);
        }, true);


        // -------------------------------

        function freeModal() {
            ModalService.showModal(self.freeOpts)
                .then(function (results) {
                    $scope.freeModalOutput = results;
                }, function (error) {
                    $scope.freeModalOutput = error;
                });
        }

        //##------------utils

        function _log(msg) {
            console.log(msg);
        }

    }
})();
