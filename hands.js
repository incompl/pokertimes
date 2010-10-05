//straight don't check 4 inside draws

var LAST_WINNING_HAND_NAME="",tests=["straight_flush","four_of_a_kind","full_house","flush","straight","three_of_a_kind","two_pair","one_pair","hi_card"];
function get_winners(my_players){
 var winners;
 for(var i=0;i<tests.length;i++){
  winners=winners_helper(my_players,tests[i]);
  if(winners){

//var s="";for(var j=0;j<winners.length;j++){if(winners[j]>0)s+=my_players[j].name+",\n";}alert(tests[i]+"!!!\n\n"+s);

   break;
  }
 }
 return winners;
}

function get_last_winning_hand_name(){return LAST_WINNING_HAND_NAME;}
function winners_helper(my_players,test){
 var best="",winners=new Array(my_players.length);
 for(var i=0;i<my_players.length;i++){
  if(!my_players[i])continue;
  var a=eval("test_"+test+"(my_players[i])");
  var num_needed=get_xml("num_needed",a);
  if(num_needed>0||(num_needed==0&&num_needed!="0"))continue;
  LAST_WINNING_HAND_NAME=get_xml("hand_name",a);
  var comp=eval("compare_"+test+"(a,best)");

//alert("TESTING "+my_players[i].name+"'s "+test+"\na: "+a+"\nb: "+best+"\n\nwinner: "+comp);

  if(comp=="a"){
   best=a;
   winners=new Array(my_players.length);
   winners[i]=1;
  }else if(comp=="b"){
  }else if(comp=="c"){
   winners[i]=1;
  }
 }
 for(var i=0;i<winners.length;i++){if(winners[i])return winners;}
 return null;
}

function test_straight_flush(player){
 var my_cards=group_cards(player);
 var the_suit=get_predominant_suit(my_cards);
 var working_cards=new Array(8);
 var working_index=0;
 for(var i=0;i<7;i++){
  if(get_suit(my_cards[i])==the_suit){
   var my_rank=get_rank(my_cards[i]);
   working_cards[working_index++]=my_rank;
   if(my_rank==14)working_cards[7]=1; //ace==1 too
  }
 }
 for(var i=0;i<working_cards.length;i++)if(working_cards[i]==null)working_cards[i]=-1; //FF
 working_cards.sort(compNum);
 var absolute_longest_stretch=0;
 var absolute_hi_card=0;
 var current_longest_stretch=1;
 var current_hi_card=0;
 for(var i=0;i<8;i++){
  var a=working_cards[i];
  var b=working_cards[i+1];
  if(a&&b&&a-b==1){
   current_longest_stretch++;
   if(current_hi_card<1)current_hi_card=a;
  }else if(a){
   if(current_longest_stretch>absolute_longest_stretch){
    absolute_longest_stretch=current_longest_stretch;
    if(current_hi_card<1)current_hi_card=a;
    absolute_hi_card=current_hi_card;
   }
   current_longest_stretch=1;
   current_hi_card=0;
  }
 }
 var num_mine=0;
 for(var i=0;i<absolute_longest_stretch;i++){
  if(the_suit+(absolute_hi_card-i)==player.carda||the_suit+(absolute_hi_card-i)==player.cardb)num_mine++;  
 } 
 return make_xml("straight_hi",absolute_hi_card)+
  make_xml("num_needed",5-absolute_longest_stretch)+
  make_xml("num_mine",num_mine)+
  make_xml("hand_name","Straight Flush");
}
function compare_straight_flush(a,b){return compare_straight(a,b);}

function test_four_of_a_kind(player){
 var my_cards=group_cards(player);
 var ranks=new Array(13);
 for(var i=0;i<13;i++)ranks[i]=0;
 for(var i=0;i<my_cards.length;i++)ranks[get_rank(my_cards[i])-2]++;
 var four="",kicker="";
 for(var i=0;i<13;i++){if(ranks[i]==4)four=i+2;else if(ranks[i]>0)kicker=i+2;}
 var num_mine=0;
 if(get_rank(player.carda)==four)num_mine++;
 if(get_rank(player.cardb)==four)num_mine++;
 var num_needed=4;
 if(four)num_needed=0;
 return make_xml("rank",four)+make_xml("kicker",kicker)+
  make_xml("num_needed",num_needed)+
  make_xml("num_mine",num_mine)+
  make_xml("hand_name","Four of a Kind");
}
function compare_four_of_a_kind(a,b){
 var rank_a=get_xml("rank",a);
 var rank_b=get_xml("rank",b);
 if(rank_a>rank_b)return "a";
 else if(rank_b>rank_a)return "b";
 else{
  var kicker_a=get_xml("kicker",a);
  var kicker_b=get_xml("kicker",b);
  if(kicker_a>kicker_b)return "a";
  else if(kicker_b>kicker_a)return "b";
  else return "c";
 }
}

function test_full_house(player){
 var my_cards=group_cards(player);
 var ranks=new Array(13);
 for(var i=0;i<13;i++)ranks[i]=0;
 for(var i=0;i<my_cards.length;i++)ranks[get_rank(my_cards[i])-2]++;
 var three="";
 var two="";
 for(var i=0;i<13;i++){
  if(ranks[i]==3){
   if(three>two)two=three;
   three=i+2;
  }else if(ranks[i]==2)two=i+2;
 }
 var result="";
 var num_needed=5;
 var major_rank="";
 var num_mine_major=0;
 if(three){
  num_needed-=3;
  major_rank=three;
  if(get_rank(player.carda)==three)num_mine_major+=1;
  if(get_rank(player.cardb)==three)num_mine_major+=1;
 }
 result+=make_xml("major_rank",major_rank);
 result+=make_xml("num_mine_major",num_mine_major);
 var minor_rank="";
 var num_mine_minor=0;
 if(two){
  num_needed-=2;
  minor_rank=two;
  if(get_rank(player.carda)==two)num_mine_minor+=1;
  if(get_rank(player.cardb)==two)num_mine_minor+=1;
 }
 result+=make_xml("minor_rank",minor_rank)+
  make_xml("num_mine_minor",num_mine_minor)+
  make_xml("num_mine",num_mine_minor+num_mine_major)+
  make_xml("num_needed",num_needed)+
  make_xml("hand_name","Full House");
 return result;
}
function compare_full_house(a,b){
 var major_a=get_xml("major_rank",a);
 var major_b=get_xml("major_rank",b);
 if(major_a>major_b)return "a";
 else if(major_b>major_a)return "b";
 else{
  var minor_a=get_xml("minor_rank",a);
  var minor_b=get_xml("minor_rank",b);
  if(minor_a>minor_b)return "a";
  else if(minor_b>minor_a)return "b";
  else return "c";
 }
}

function test_flush(player){
 var my_cards=group_cards(player);
 var the_suit=get_predominant_suit(my_cards);
 var working_cards=new Array(7);
 var working_index=0;
 var num_in_flush=0;
 for(var i=0;i<my_cards.length;i++){
  if(get_suit(my_cards[i])==the_suit){
   num_in_flush++;
   working_cards[working_index++]=get_rank(my_cards[i]);
  }
 }
 for(var i=0;i<working_cards.length;i++)if(working_cards[i]==null)working_cards[i]=-1; //FF
 working_cards.sort(compNum);
 var result="";
 var num_mine=0;
 for(var i=0;i<5;i++){
  var s=working_cards[i];
  if(!s)s="";
  result+=make_xml("flush_"+i,s);
  if(the_suit+working_cards[i]==player.carda||the_suit+working_cards[i]==player.cardb)num_mine++;
 }
 result+=make_xml("num_needed",5-num_in_flush)+
  make_xml("num_mine",num_mine)+
  make_xml("suit",the_suit)+
  make_xml("hand_name","Flush");
 return result;
}
function compare_flush(a,b){
 for(var i=0;i<5;i++){
  var flush_a=get_xml("flush_"+i,a);
  var flush_b=get_xml("flush_"+i,b);
  if(flush_a>flush_b)return "a";
  else if(flush_b>flush_a)return "b";
 }
 return "c";
}

function test_straight(player){
 var my_cards=group_cards(player);
 var working_cards=new Array(8);
 var ranks=new Array(13);
 for(var i=0;i<7;i++){
  var my_rank=get_rank(my_cards[i]);
  if(ranks[my_rank-2])continue;
  else ranks[my_rank-2]=1;
  working_cards[i]=my_rank;
  if(my_rank==14)working_cards[7]=1; //ace==1 too
 }
 for(var i=0;i<working_cards.length;i++)if(working_cards[i]==null)working_cards[i]=-1; //FF
 working_cards.sort(compNum);
 var absolute_longest_stretch=0;
 var absolute_hi_card=0;
 var current_longest_stretch=1;
 var current_hi_card=0;
 for(var i=0;i<8;i++){
  var a=working_cards[i];
  var b=working_cards[i+1];
  if(a&&b&&a-b==1){
   current_longest_stretch++;
   if(current_hi_card<1)current_hi_card=a;
  }else if(a){
   if(current_longest_stretch>absolute_longest_stretch){
    absolute_longest_stretch=current_longest_stretch;
    if(current_hi_card<1)current_hi_card=a;
    absolute_hi_card=current_hi_card;
   }
   current_longest_stretch=1;
   current_hi_card=0;
  }
 }
 var num_mine=0;
 for(var i=0;i<absolute_longest_stretch;i++){
  if(absolute_hi_card-i==get_rank(player.carda)||absolute_hi_card-i==get_rank(player.cardb))num_mine++;  
 } 
 return make_xml("straight_hi",absolute_hi_card)+
  make_xml("num_needed",5-absolute_longest_stretch)+
  make_xml("num_mine",num_mine)+
  make_xml("hand_name","Straight");
}
function compare_straight(a,b){
 var hi_a=get_xml("straight_hi",a);
 var hi_b=get_xml("straight_hi",b);
 if(hi_a>hi_b)return "a";
 else if(hi_b>hi_a)return "b";
 else return "c";
}

function test_three_of_a_kind(player){
 var my_cards=group_cards(player);
 var ranks=new Array(13);
 for(var i=0;i<13;i++)ranks[i]=0;
 for(var i=0;i<my_cards.length;i++)ranks[get_rank(my_cards[i])-2]++;
 var three="",kicker_1="",kicker_2="";
 for(var i=0;i<13;i++){
  if(ranks[i]==3)three=i+2;
  else if(ranks[i]==1){
   kicker_2=kicker_1;
   kicker_1=i+2;
  }else if(ranks[i]>1){
   kicker_1=i+2;
   kicker_2=i+2;
  }
 }
 var num_mine=0;
 if(get_rank(player.carda)==three)num_mine++;
 if(get_rank(player.cardb)==three)num_mine++;
 var num_needed=3;
 if(three)num_needed=0;
 return make_xml("rank",three)+
  make_xml("num_needed",num_needed)+
  make_xml("num_mine",num_mine)+
  make_xml("kicker_1",kicker_1)+
  make_xml("kicker_2",kicker_2)+
  make_xml("hand_name","Three of a Kind");
}
function compare_three_of_a_kind(a,b){
 var rank_a=get_xml("rank",a);
 var rank_b=get_xml("rank",b);
 if(rank_a>rank_b)return "a";
 else if(rank_b>rank_a)return "b";
 else{
  var kicker_a=get_xml("kicker_1",a);
  var kicker_b=get_xml("kicker_1",b);
  if(kicker_a>kicker_b)return "a";
  else if(kicker_b>kicker_a)return "b";
  else{
   kicker_a=get_xml("kicker_2",a);
   kicker_b=get_xml("kicker_2",b);
   if(kicker_a>kicker_b)return "a";
   else if(kicker_b>kicker_a)return "b";
   else return "c";
  }
 }
}

function test_two_pair(player){
 var my_cards=group_cards(player);
 var ranks=new Array(13);
 for(var i=0;i<13;i++)ranks[i]=0;
 for(var i=0;i<my_cards.length;i++)ranks[get_rank(my_cards[i])-2]++;
 var first="",second="",kicker="";
 for(var i=12;i>-1;i--){
  if(ranks[i]==2){
   if(!first)first=i+2;
   else if(!second)second=i+2;
   else if(!kicker)kicker=i+2;
   else break;
  }else if(!kicker&&ranks[i]>0)kicker=i+2;
 }
 var num_mine=0;
 if(get_rank(player.carda)==first||get_rank(player.carda)==second)num_mine++;
 if(get_rank(player.cardb)==first||get_rank(player.cardb)==second)num_mine++;
 var num_needed=2;
 if(second)num_needed=0;
 else if(first)num_needed=1;
 else num_needed=2;
 return make_xml("rank_1",first)+make_xml("rank_2",second)+
  make_xml("num_needed",num_needed)+make_xml("num_mine",num_mine)+
  make_xml("kicker",kicker)+
  make_xml("hand_name","Two Pair");
}
function compare_two_pair(a,b){
 var rank_a=get_xml("rank_1",a);
 var rank_b=get_xml("rank_1",b);
 if(rank_a>rank_b)return "a";
 else if(rank_b>rank_a)return "b";
 else{
  rank_a=get_xml("rank_2",a);
  rank_b=get_xml("rank_2",b);
  if(rank_a>rank_b)return "a";
  else if(rank_b>rank_a)return "b";
  else{
   var kicker_a=get_xml("kicker",a);
   var kicker_b=get_xml("kicker",b);
   if(kicker_a>kicker_b)return "a";
   else if(kicker_b>kicker_a)return "b";
   else return "c";
  }
 }
}

function test_one_pair(player){
 var my_cards=group_cards(player);
 var ranks=new Array(13);
 for(var i=0;i<13;i++)ranks[i]=0;
 for(var i=0;i<my_cards.length;i++)ranks[get_rank(my_cards[i])-2]++;
 var pair="",kicker_1="",kicker_2="",kicker_3="";
 for(var i=0;i<13;i++){
  if(ranks[i]==2)pair=i+2;
  else if(ranks[i]==1){kicker_3=kicker_2;kicker_2=kicker_1;kicker_1=i+2;}
  else if(ranks[i]>2){kicker_1=i+2;kicker_2=i+2;kicker_3=i+2;}
 }
 var num_mine=0;
 if(get_rank(player.carda)==pair)num_mine++;
 if(get_rank(player.cardb)==pair)num_mine++;
 var num_needed=1;
 if(pair)num_needed=0;
 return make_xml("rank",pair)+
  make_xml("num_needed",num_needed)+
  make_xml("num_mine",num_mine)+
  make_xml("kicker_1",kicker_1)+make_xml("kicker_2",kicker_2)+make_xml("kicker_3",kicker_3)+
  make_xml("hand_name","One Pair");
}
function compare_one_pair(a,b){
 var rank_a=get_xml("rank",a);
 var rank_b=get_xml("rank",b);
 if(rank_a>rank_b)return "a";
 else if(rank_b>rank_a)return "b";
 else{
  var kicker_a=get_xml("kicker_1",a);
  var kicker_b=get_xml("kicker_1",b);
  if(kicker_a>kicker_b)return "a";
  else if(kicker_b>kicker_a)return "b";
  else{
   kicker_a=get_xml("kicker_2",a);
   kicker_b=get_xml("kicker_2",b);
   if(kicker_a>kicker_b)return "a";
   else if(kicker_b>kicker_a)return "b";
   else{
    kicker_a=get_xml("kicker_3",a);
    kicker_b=get_xml("kicker_3",b);
    if(kicker_a>kicker_b)return "a";
    else if(kicker_b>kicker_a)return "b";
    else return "c";
   }
  }
 }
}

function test_hi_card(player){
 var my_cards=group_cards(player);
 var working_cards=new Array(my_cards.length);
 for(var i=0;i<working_cards.length;i++)working_cards[i]=get_rank(my_cards[i]);
 for(var i=0;i<working_cards.length;i++)if(working_cards[i]==null)working_cards[i]=-1; //FF
 working_cards.sort(compNum);
 var result="";
 for(var i=0;i<5;i++){
  if(!working_cards[i])working_cards[i]="";
  result+=make_xml("hi_card_"+i,working_cards[i]);
 }
 return result+make_xml("num_needed",0)+make_xml("hand_name","High Card");
}
function compare_hi_card(a,b){
 for(var i=0;i<5;i++){
  var hi_a=get_xml("hi_card_"+i,a);
  var hi_b=get_xml("hi_card_"+i,b);
  if(hi_a>hi_b)return "a";
  else if(hi_b>hi_a)return "b";
 }
 return "c";
}

function make_xml(tag,dat){return "<"+tag+">"+dat+"</"+tag+">";}
function get_xml(tag,dat){
 var a=dat.indexOf("<"+tag+">");
 if(a<0)return "";
 var b=dat.indexOf("</"+tag+">");
 if(b<=a)return "";
 var ret=dat.substring(a+tag.length+2,b);
 var r=ret.match(/^(\d+)$/);
 if(r)return (ret-0);
 else return ret;
}
function get_suit(card){if(card)return card.substring(0,1);else return "";}
function get_rank(card){if(card)return card.substring(1)-0;else return "";}
function get_predominant_suit(my_cards){
 var suit_count=[0,0,0,0];
 for(var i=0;i<my_cards.length;i++){
  var s=get_suit(my_cards[i]);
  if(s=="c")suit_count[0]++;
  else if(s=="s")suit_count[1]++;
  else if(s=="h")suit_count[2]++;
  else if(s=="d")suit_count[3]++;
 }
 var suit_index=0;
 if(suit_count[1]>suit_count[suit_index])suit_index=1;
 if(suit_count[2]>suit_count[suit_index])suit_index=2;
 if(suit_count[3]>suit_count[suit_index])suit_index=3;
 if(suit_index==0)return "c";
 else if(suit_index==1)return "s";
 else if(suit_index==2)return "h";
 else if(suit_index==3)return "d";
 return "";
}
function group_cards(player){
 var c=new Array(7);
 for(var i=0;i<5;i++)c[i]=board[i];
 c[5]=player.carda;
 c[6]=player.cardb;
 return c;
}
function compNum(a,b){return b-a;}