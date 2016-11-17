Community.directive('postCard', ['IpfsService','$location','$window','ProfileDB',
function(IpfsService,$location,$window,ProfileDB){
	return {
		restrict: 'E',
		scope: {
            ipfsHash: '=',
		},
		replace: true,
		templateUrl: 'directives/post/postDirective.html',
		controller: function($scope){
            //console.log($scope.event);
            
            $scope.post = IpfsService.getIpfsData($scope.ipfsHash).then(
            function(ipfsData){
                $scope.post = ipfsData;
                
                $scope.postScore = ProfileDB.getPostScore($scope.activeView,$scope.ipfsHash);
                
                if($scope.post.postType === 'image'){
                    var img = new Image();
                    img.onload= function() {
                        //console.log("Image loaded");
                        if(this.width > this.height){
                            $scope.orientation = 'horizontal';
                            $scope.layout= 'column';
                        } else {
                            $scope.orientation = 'vertical';
                            $scope.layout = 'row';
                        }
                    }
                    
                    var url;
                    if($scope.post.postLink){
                        var slice = $scope.post.postLink.slice(0,2);
                        //console.log($scope.post.postLink);
                        if(slice === 'Qm'){
                            var absUrl = $location.absUrl();
                            var index = absUrl.indexOf('ipfs');
                            var urlSlice = absUrl.slice(0,index+5);
                            url = urlSlice + $scope.post.postLink;
                        } else {
                            url = $scope.post.postLink;
                        }
                    }
                    img.src = url;

                    var slice = $scope.post.postLink.slice(0,2);
                    if(slice === 'Qm'){
                        var url = $location.absUrl().split('/');
                        $scope.imageSource = url[0] + '//' + url[2] + '/' + url[3] + '/' + $scope.post.postLink;
                    } else {
                        $scope.imageSource = $scope.post.postLink;
                    }
                } else if($scope.post.postType === 'video'){
                    var url = $scope.post.postLink;
                    //console.log(url);
                    
                    function getParm(url, base) {
                        var re = new RegExp("(\\?|&)" + base + "\\=([^&]*)(&|$)");
                        var matches = url.match(re);
                        if (matches) {
                            return(matches[2]);
                        } else {
                            return("");
                        }
                    }

                    var retVal = {};
                    var matches;

                    if (url.indexOf("youtube.com/watch") != -1) {
                        retVal.provider = "youtube";
                        retVal.id = getParm(url, "v");
                    } else if (matches = url.match(/vimeo.com\/(\d+)/)) {
                        retVal.provider = "vimeo";
                        retVal.id = matches[1];
                    }
                    
                    //console.log(retVal);
                    if(retVal.provider == 'youtube')
                        $scope.videoSourceUrl = 'https://www.youtube.com/v/' + retVal.id + '&rel=0';
                    else if(retVal.provider == 'vimeo')
                        $scope.videoSourceUrl = 'https://www.vimeo.com/' + retVal.id;
                    
                    //console.log($scope.videoSourceUrl);
                }
            },function(err){
                console.error(err);
            });  
            
            $scope.followLink = function(){
                if($scope.post.postLink){
                    var slice = $scope.post.postLink.slice(0,2);
                    console.log($scope.post.postLink);
                    if(slice === 'Qm'){
                        var absUrl = $location.absUrl();
                        var index = absUrl.indexOf('ipfs');
                        var urlSlice = absUrl.slice(0,index+5);
                        var url = urlSlice + $scope.post.postLink;
                        $window.open(url);
                    } else {
                        var url = $location.url();
                        $window.open($scope.post.postLink);
                    }
                } else {
                    console.log("self post");
                    $location.url('c/' + $scope.post.postCommunity + '/post/' + $scope.ipfsHash);
                }
            }
            
            var locationUrlArray = $location.url().split('/');
            $scope.commentView = false;
            if(locationUrlArray[3] == 'post')
                $scope.commentView = true;
        },
		link : function($scope, $element, $attrs) {
            //console.log($scope.postUrl);
            
		}
	}
}]);