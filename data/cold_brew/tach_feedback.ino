int tach = 0;
long t = 0;
int cnt = 0;
int state = 0;
float rpm = 0.0;
float rolling_rpm = 0.0;
int PWM = 255;
int thrown_bar_cnt = 0;
int stall_cnt = 0;
int diff = 0;

void setup() {
  Serial.begin(9600);
  pinMode(11, OUTPUT);
  analogWrite(3, 255);
}

void loop() {
  tach = analogRead(A0);
  //Serial.println(tach);

  if (millis() - t < 1500) {
    if (tach == 0) {
      state = 0;
    }
    else if ((tach > 700) && (state == 0)) {
      cnt += 1;
      state = 1;
    }
  }
  else {
    t = millis();
    rpm = cnt * 4.444;  // * 40 seconds / 9 fan blades
    cnt = 0;
    // if rpm
    analogWrite(3, PWM);
    Serial.println(rpm);

    // test if stir bar is thrown
    if (rpm > 800) {
      thrown_bar_cnt += 1;
      if (thrown_bar_cnt > 2) {
        // stop
        analogWrite(3, 0);
        delay(5000);
        // kickstart
        Serial.println("kick");
        digitalWrite(11, HIGH);
        delay(4000);
        digitalWrite(11, LOW);
        analogWrite(3, 255);
        // decrease steady state pwm
        PWM -= 5;
      }
    }
    else if (rpm > 450) {
      diff = (rpm - 400) / 10;
      PWM -= diff;
      Serial.println("slowing");
    }
    else if ((rpm < 300) && (rpm > 100)) {
      if (PWM < 250) {
        PWM += 5;
        Serial.println("quickening");  
      }  
    }
    else {
      thrown_bar_cnt = 0;
    }
    // test if stalled
    if (rpm < 5) {
      stall_cnt += 1;
      if (stall_cnt > 5) {
        // attempt 9V kickstart
        Serial.println("kickstall");
        analogWrite(3, 0);
        digitalWrite(11, HIGH);
        delay(2000);
        analogWrite(3, 255);
        digitalWrite(11, LOW);

        // turn off for good
        if (stall_cnt > 6) {
          analogWrite(3, 0);
          digitalWrite(11, LOW);
          delay(43200000);
        }
        
      }
    }
    else {
      stall_cnt = 0;
    }

  }
}

