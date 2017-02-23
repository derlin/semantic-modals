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
        .controller('MainCtrl', ctrl);

    // --------------------------

    function ctrl($scope, ModalService) {

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

        //##------------available methods

        self.modalInputsCancelable = modalInputsCancelable;
        self.modalBasicIcon = modalBasicIcon;
        self.modalHtmlInput = modalHtmlInput;
        self.modalHtmlInclude = modalHtmlInclude;
        self.modalTemplate = modalTemplate;
        self.freeModal = freeModal;


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


        function modalInputsCancelable() {
            ModalService.showModal({
                title: "confirm",
                text: "are you sure ?",
                positive: "yep",
                negative: "cancel",
                cancelable: true

            }).then(function (result) {
                $scope.inputsCancelableOutput = result;
            }, function (error) {
                $scope.inputsCancelableOutput = error;
            });
        }

        function modalBasicIcon() {
            ModalService.showModal({
                title: "Confirm deletion",
                html: "<p>are you absolutely sure ?</p><p>You cannot undo this action.</p>",
                positive: "proceed",
                negative: "cancel",
                icon: "warning sign orange",
                basic: true,
            }).then(function (result) {
                $scope.basicIconOutput = result;
                console.log("modalBasicIcon closed. Result=" + result);
            }, function (error) {
                $scope.basicIconOutput = error;
            });
        }

        function modalHtmlInput() {
            ModalService.showModal({
                title: "confirm",
                html: "are you sure you want to delete {{inputs.sensor.name}} ({{inputs.sensor.id}} ) ?",
                positive: "yes",
                basic: true,
                inputs: {
                    sensor: {id: 3, name: "sensor-XXXX"}
                },
                cancelable: false

            }).then(function (result) {
                $scope.htmlInputOutput = result;
                console.log("htmlInput closed. Result=" + result);
            }, function (error) {
                $scope.htmlInputOutput = error;
            });
        }

        function modalHtmlInclude() {
            ModalService.showModal({
                title: "html include",
                htmlInclude: "partial/editModal_content.html",
                inputs: {name: "some name", description: "a description", hidden: "hidden"},
                positive: "do it!",
                cancelable: false

            }).then(function (result) {
                $scope.htmlIncludeOutput = result;
                console.log("htmlInclude closed. Result=" + result);
            }, function (error) {
                $scope.htmlIncludetOutput = error;
            });
        }

        function modalTemplate() {
            ModalService.showModal({
                templateUrl: "semanticModalTemplate.html",
                cancelable: false

            }).then(function (result) {
                $scope.modalTemplateOutput = result;
                console.log("modalTemplate closed. Result=" + result);
            }, function (error) {
                $scope.modalTemplateOutput = error;
            });
        }


        //##------------utils

        function _log(msg) {
            console.log(msg);
        }

    }
})();
