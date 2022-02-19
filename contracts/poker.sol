//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Poker {
    struct Player {
        uint player_id;
        address player_address;
    }
    
    enum GameState{JOINING, SHUFFLING, DECRYPTION, ROUND1, VERIFICATION}
    
    uint public num_players = 0;
    mapping(uint => Player) public players;
    mapping(address => uint) public player_id_by_address;
    mapping(uint => uint[]) player_cards;
    uint[] public card_list;
    uint public current_player_turn = 0;
    GameState public game_state = GameState.JOINING;
    event Turn(uint player_turn, GameState curr_game_state);


    modifier player_present{
        require(player_id_by_address[msg.sender] != 0, "Invalid player");
        _;
    }

    constructor() {
        console.log("Poker constructed");
    }
    function join() public {
        if (player_id_by_address[msg.sender] == 0) {   
            require(game_state == GameState.JOINING, "Game is not in joining state");
            num_players+=1;
            Player memory player;
            player.player_id = num_players;
            player.player_address = msg.sender;
            players[num_players] = player;
            player_id_by_address[msg.sender] = num_players;
            console.log("Player joined ", player.player_address, "  ", player.player_id);
        }

    }
    function initiate_distribution(uint[] calldata cards) public {
        require(msg.sender == players[1].player_address, "Only host can initiate" );
        require(game_state == GameState.JOINING, "Game is not in joining state");
        console.log("Distribution initiated");
        console.log(cards[0]);
        card_list = cards;
        current_player_turn = 2;
        game_state = GameState.SHUFFLING;
        emit Turn(2, game_state);
        
    }
    function pick_cards(uint[] calldata cards, uint[] calldata picked_cards) public{
        require(game_state == GameState.SHUFFLING, "Game is not in shuffling state");
        uint player_id = player_id_by_address[msg.sender];
        require(player_id == current_player_turn, "Player playing out of turn");
        require(player_id != num_players, "Last player should call pick_host_cards() only");
        // TODO: Check length of picked cards etc
        card_list = cards;
        player_cards[player_id] = picked_cards;

        if (current_player_turn < num_players){
            current_player_turn +=1;
            emit Turn(current_player_turn, game_state);

        }
        else{
            console.log("Error: how did you reach here?");
            // Handle next segment;
        }
    }
    function pick_host_cards(uint[] calldata remaining_cards, uint[] calldata picked_cards, uint[] calldata common_cards, uint[] calldata host_cards) public{
        require(game_state == GameState.SHUFFLING, "Game is not in shuffling state");
        uint player_id = player_id_by_address[msg.sender];
        require(player_id == current_player_turn, "Player playing out of turn");
        require(player_id == num_players, "Only last player can pick host cards");
        // TODO: Check length of picked cards etc
        card_list = remaining_cards;
        player_cards[player_id] = picked_cards;
        player_cards[0] = common_cards;
        player_cards[1] = host_cards;

        game_state = GameState.DECRYPTION;
        current_player_turn = 1;
        emit Turn(1, game_state);
        
    }
    function print_cards() view public {
        console.log("Cards are ");
        for(uint i = 0; i < card_list.length; i++) {
            console.log(card_list[i]);
        }
    }
    function print_player_cards(uint pid) view public {
        console.log("Player ", pid, "cards are");
        for (uint i=0; i< player_cards[pid].length; i++){
            console.log(player_cards[pid][i]);
        }
    }
    function set_players_cards(uint[] calldata cards) public {
        require(game_state == GameState.DECRYPTION, "Game is not in decryption state");
        uint player_id = player_id_by_address[msg.sender];
        require(player_id == current_player_turn, "Player playing out of turn");
        uint index = 0;
        while(index < 5){
            player_cards[0][index] = cards[index];
            index+=1;
        }
        for(uint i=0; i<num_players; i++){
            player_cards[i][0] = cards[index];
            player_cards[i][1] = cards[index+1];
            index+=2;
        }
        if (current_player_turn < num_players){
            current_player_turn +=1;
            emit Turn(current_player_turn, game_state);
        }
        else{
            game_state = GameState.ROUND1;
            current_player_turn = 1;
            emit Turn(1, game_state);
        }

    }
    function set_player_cards(uint[] calldata cards) private player_present{
        require(game_state == GameState.DECRYPTION, "Game is not in decryption state");
        player_cards[player_id_by_address[msg.sender]] = cards;
    }
    function get_player_cards() public player_present view returns (uint[] memory) {
        return player_cards[player_id_by_address[msg.sender]];
    }
    function get_all_cards() public player_present view returns (uint[] memory) {
        // TODO: Change to default getter
        return card_list;
    }
    function get_player_id() public player_present view returns(uint) {
        return player_id_by_address[msg.sender];
    }
  
}
