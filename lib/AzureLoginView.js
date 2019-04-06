import React, {
	Component
} from 'react'
import {
	WebView,
	Dimensions,
	AsyncStorage,
	Platform,
	StyleSheet,
	View,
  Text,
  TouchableOpacity
} from 'react-native'

import AzureInstance from './AzureInstance'
import Auth from './Auth';

export default class AzureLoginView extends React.Component {
	props : {
		azureInstance: AzureInstance,
		onSuccess? : ?Function,
		scale : Function
	};

	state : {
	    visible: bool
  	};

	constructor(props:any){
    super(props);
    console.log(props)

		this.auth = new Auth(this.props.azureInstance);
		this.state = {
			visible: true
		}

		this._handleTokenRequest = this._handleTokenRequest.bind(this);
		this._renderLoadingView = this._renderLoadingView.bind(this);
	}

	_handleTokenRequest(e:{ url:string }):any{
		// get code when url chage
		let code = /((\?|\&)code\=)[^\&]+/.exec(e.url);

		if( code !== null ){
			code = String(code[0]).replace(/(\?|\&)?code\=/,'');
			this.setState({visible : false})

			// request for a token
			this.auth.getTokenFromCode(code).then(token => {
				// set token to instance
				this.props.azureInstance.setToken(token);

				// call success handler
				this.props.onSuccess();
			})
			.catch((err) => {
        console.log("AQUI");
        		throw new Error(err);
      		})
		}
  	}

	shouldComponentUpdate(nextProps, nextState) {
		return Platform.OS === 'android';
  }
  
  _renderLoadingView(){
    return this.props.loadingView === undefined ? (
      <View
        style={[this.props.style, styles.loadingView, 
          {
          flex:1,
          alignSelf : 'stretch',
          width : Dimensions.get('window').width,
          height : Dimensions.get('window').height
        }
      ]}
      >
        <Text>{this.props.loadingMessage}</Text>
      </View>
    ) : this.props.loadingView
  }

	render() {
    let WebViewRef;
		let js = `document.getElementsByTagName('body')[0].style.height = '${Dimensions.get('window').height}px';`

   		return (
			this.state.visible ? (
        <View>
          <TouchableOpacity style={[styles.messageBtn, {padding: this.props.scale(10)}]} onPress={()=>{ 
            (WebViewRef)
              //this.props.refresh;
              for(i=0;i<4;i++)
                WebViewRef.goBack();
            }}>
            <Text style={[styles.messageText, {fontSize: this.props.scale(11)}]}>Em caso de erro, clique aqui!</Text>
          </TouchableOpacity>
          <WebView
            ref={WEBVIEW_REF => (WebViewRef = WEBVIEW_REF)}
            automaticallyAdjustContentInsets={true}
            style={[this.props.style, {
		          marginTop: this.props.scale(40),
              flex:1,
              alignSelf : 'stretch',
              width : Dimensions.get('window').width,
              height : Dimensions.get('window').height
            }]}
            source={{uri: this.auth.getAuthUrl()}}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            decelerationRate="normal"
            javaScriptEnabledAndroid={true}
            onNavigationStateChange={this._handleTokenRequest}
            onShouldStartLoadWithRequest={(e) => {return true}}
            startInLoadingState={true}
            injectedJavaScript={js}
            scalesPageToFit={true}
          />
        </View>
         ) : this._renderLoadingView()
		)
   	}

}

const styles = StyleSheet.create({
	loadingView: {
		alignItems: 'center',
		justifyContent: 'center'
  },
  messageBtn: {
    width: '80%',
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    position:'absolute',
    backgroundColor:'transparent',
    top: 0,
  },
  messageText: {
    textAlign: 'center',
    color: '#0067B8',
    justifyContent: 'center',
  }
});
