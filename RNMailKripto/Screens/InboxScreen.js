import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Appbar, TextInput, Button, List, TouchableRipple, Portal, Dialog, Provider } from 'react-native-paper';
import coreStyle from '../styles';
const styles= coreStyle;

class InboxScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textButton: "Ambil Surat Terbaru",
      mails : [],
      mailLists : [],
      mailComposeVisibility: false,
      alertMailComposeVisibility: false,
      to: '',
      subject: '',
      isi: '',
    };    
  }
  _showMailCompose = () => this.setState({ mailComposeVisibility: true });
  _hideMailCompose = () => this.setState({ mailComposeVisibility: false });
  _showAlertMailCompose = () => this.setState({ alertMailComposeVisibility: true });
  _hideAlertMailCompose = () => this.setState({ alertMailComposeVisibility: false });

  appendList(id,from,subject) {
    let tempMails = this.state.mailLists;   
    tempMails.push(
      <TouchableRipple
        onPress={() => console.log({id})}
        rippleColor="rgba(0, 0, 0, .32)"
      >
        <List.Item
          title={from}
          description={subject}
          left={props => <List.Icon {...props} icon="mail" />}
          key={id}
        />
      </TouchableRipple>
    )
    this.setState({
        mailLists: tempMails
    })
  }

  clearMails() {
    this.setState({mails : [], mailLists : []});
  }

  fetchMails(email, password) {
    fetch('https://nodejs-mail-rest.herokuapp.com/mails', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    }).then((response) => response.json())
    .then((responseJson) => {
      let buffer = responseJson
      let buffers = []
      for (i=0;i<buffer.length;i++){
        buffers.push(buffer[i])
      }
      if (this.state.mailLists.length !== 0) {
        this.clearMails();
        this.setState({textButton : "Ambil Surat Terbaru"})
      } else {
        console.log("portal2")
        for (i = 0;i<buffers.length;i++) {
          this.appendList(buffers[i].seqnum,buffers[i].from,buffers[i].subject);
        }   
        this.setState({textButton : "Kosongkan Kotak Surat"})
      }               
    })
    .catch((error) => {
      console.error(error);
    });
    
  }

  render() {
    const email = this.props.navigation.getParam('email', '');
    const password = this.props.navigation.getParam('password', '');

    return (
      <Provider>
        <ScrollView style={styles.container}>
          <View style={styles.controller}>
            <Text>
              {email} - {password}
            </Text>
            <Button mode="contained" onPress={() => {
              if (email === '' || password === '') {
                this._showAlertMailCompose();
              } else {
                this.fetchMails(email,password)
              }              
            }}
            >
              {this.state.textButton}
            </Button>
            <Button mode="contained" onPress={() => {
              if (email === '' || password === '') {
                this._showAlertMailCompose();
              } else {
                this._showMailCompose()                
              }
            }}
            >
              Buat Surat Baru
            </Button>          
          </View>
          <Text>
            {this.state.mails}
          </Text>
          <View>
            {this.state.mailLists}
          </View>        
        </ScrollView>
        <Portal>
          <Dialog
            contentContainerStyle={styles.composeMailModalContainer}
            visible={this.state.mailComposeVisibility}
            onDismiss={this._hideMailCompose}
          >
            <Dialog.Actions>
              <Button onPress={this._hideMailCompose}>Batal</Button>
              <Button onPress={this._hideMailCompose}>Kirim</Button>
            </Dialog.Actions>
            <Dialog.Content>
              <ScrollView>
                <TextInput
                  type="email-address"
                  style={styles.textInput}
                  placeholder="Email Tujuan"
                  onChangeText={(to) => this.setState({to})}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Subjek"
                  onChangeText={(subject) => this.setState({subject})}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Isi pesan"
                  multiline={true}
                  onChangeText={(isi) => this.setState({isi})}
                />
              </ScrollView>
            </Dialog.Content>
          </Dialog>         
        </Portal>
        <Portal>
          <Dialog
            contentContainerStyle={styles.composeMailModalContainer}
            visible={this.state.alertMailComposeVisibility}
            onDismiss={this._hideAlertMailCompose}
          >
            <Dialog.Title>Alert</Dialog.Title>
            <Dialog.Content>
              <Text>Tolong isi email dan password terlebih dahulu</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this._hideAlertMailCompose}>Done</Button>
            </Dialog.Actions>
          </Dialog>         
        </Portal>
      </Provider>
    );
  }
}

export default InboxScreen;