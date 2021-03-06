// Type definitions for multicodec 1.0
// Project: https://github.com/multiformats/js-multicodec#readme
// Definitions by: Carson Farmer <https://github.com/carsonfarmer>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.9
/// <reference types="node" />

declare module "multicodec" {
  export as namespace Multicodec;

  /**
   * Prefix a Uint8Array with a multicodec_packed.
   */
  export function addPrefix(
    multicodecStrOrCode: string | number | Uint8Array,
    data: Uint8Array
  ): Uint8Array;

  /**
   * Decapsulate the multicodec_packed prefix from the data.
   */
  export function rmPrefix(data: Uint8Array): Uint8Array;

  /**
   * Get the codec of the prefixed data.
   */
  export function getCodec(prefixedData: Uint8Array): string;

  /**
   * Get the name of the codec.
   */
  export function getName(codec: number): string;

  /**
   * Get the code of the codec
   */
  export function getNumber(name: string): number;

  /**
   * Get the code of the prefixed data.
   */
  export function getCode(prefixedData: Uint8Array): number;

  /**
   * Get the code as varint of a codec name.
   */
  export function getCodeVarint(codecName: string): Uint8Array;

  /**
   * Get the varint of a code.
   */
  export function getVarint(code: number): number[];

  /**
   * Human friendly names for printing, e.g. in error messages
   */
  export const print: Record<number, string>;

  /**
   * Map of codecConstant to code
   */
  // Derived from https://github.com/multiformats/js-multicodec/blob/master/src/constants.js
  export const IDENTITY = 0;
  export const IP4 = 4;
  export const TCP = 6;
  export const SHA1 = 17;
  export const SHA2_256 = 18;
  export const SHA2_512 = 19;
  export const SHA3_512 = 20;
  export const SHA3_384 = 21;
  export const SHA3_256 = 22;
  export const SHA3_224 = 23;
  export const SHAKE_128 = 24;
  export const SHAKE_256 = 25;
  export const KECCAK_224 = 26;
  export const KECCAK_256 = 27;
  export const KECCAK_384 = 28;
  export const KECCAK_512 = 29;
  export const DCCP = 33;
  export const MURMUR3_128 = 34;
  export const MURMUR3_32 = 35;
  export const IP6 = 41;
  export const IP6ZONE = 42;
  export const PATH = 47;
  export const MULTICODEC = 48;
  export const MULTIHASH = 49;
  export const MULTIADDR = 50;
  export const MULTIBASE = 51;
  export const DNS = 53;
  export const DNS4 = 54;
  export const DNS6 = 55;
  export const DNSADDR = 56;
  export const PROTOBUF = 80;
  export const CBOR = 81;
  export const RAW = 85;
  export const DBL_SHA2_256 = 86;
  export const RLP = 96;
  export const BENCODE = 99;
  export const DAG_PB = 112;
  export const DAG_CBOR = 113;
  export const LIBP2P_KEY = 114;
  export const GIT_RAW = 120;
  export const TORRENT_INFO = 123;
  export const TORRENT_FILE = 124;
  export const LEOFCOIN_BLOCK = 129;
  export const LEOFCOIN_TX = 130;
  export const LEOFCOIN_PR = 131;
  export const SCTP = 132;
  export const ETH_BLOCK = 144;
  export const ETH_BLOCK_LIST = 145;
  export const ETH_TX_TRIE = 146;
  export const ETH_TX = 147;
  export const ETH_TX_RECEIPT_TRIE = 148;
  export const ETH_TX_RECEIPT = 149;
  export const ETH_STATE_TRIE = 150;
  export const ETH_ACCOUNT_SNAPSHOT = 151;
  export const ETH_STORAGE_TRIE = 152;
  export const BITCOIN_BLOCK = 176;
  export const BITCOIN_TX = 177;
  export const ZCASH_BLOCK = 192;
  export const ZCASH_TX = 193;
  export const STELLAR_BLOCK = 208;
  export const STELLAR_TX = 209;
  export const MD4 = 212;
  export const MD5 = 213;
  export const BMT = 214;
  export const DECRED_BLOCK = 224;
  export const DECRED_TX = 225;
  export const IPLD_NS = 226;
  export const IPFS_NS = 227;
  export const SWARM_NS = 228;
  export const IPNS_NS = 229;
  export const ZERONET = 230;
  export const ED25519_PUB = 237;
  export const DASH_BLOCK = 240;
  export const DASH_TX = 241;
  export const SWARM_MANIFEST = 250;
  export const SWARM_FEED = 251;
  export const UDP = 273;
  export const P2P_WEBRTC_STAR = 275;
  export const P2P_WEBRTC_DIRECT = 276;
  export const P2P_STARDUST = 277;
  export const P2P_CIRCUIT = 290;
  export const DAG_JSON = 297;
  export const UDT = 301;
  export const UTP = 302;
  export const UNIX = 400;
  export const P2P = 421;
  export const IPFS = 421;
  export const HTTPS = 443;
  export const ONION = 444;
  export const ONION3 = 445;
  export const GARLIC64 = 446;
  export const GARLIC32 = 447;
  export const TLS = 448;
  export const QUIC = 460;
  export const WS = 477;
  export const WSS = 478;
  export const P2P_WEBSOCKET_STAR = 479;
  export const HTTP = 480;
  export const JSON = 512;
  export const MESSAGEPACK = 513;
  export const X11 = 4352;
  export const BLAKE2B_8 = 45569;
  export const BLAKE2B_16 = 45570;
  export const BLAKE2B_24 = 45571;
  export const BLAKE2B_32 = 45572;
  export const BLAKE2B_40 = 45573;
  export const BLAKE2B_48 = 45574;
  export const BLAKE2B_56 = 45575;
  export const BLAKE2B_64 = 45576;
  export const BLAKE2B_72 = 45577;
  export const BLAKE2B_80 = 45578;
  export const BLAKE2B_88 = 45579;
  export const BLAKE2B_96 = 45580;
  export const BLAKE2B_104 = 45581;
  export const BLAKE2B_112 = 45582;
  export const BLAKE2B_120 = 45583;
  export const BLAKE2B_128 = 45584;
  export const BLAKE2B_136 = 45585;
  export const BLAKE2B_144 = 45586;
  export const BLAKE2B_152 = 45587;
  export const BLAKE2B_160 = 45588;
  export const BLAKE2B_168 = 45589;
  export const BLAKE2B_176 = 45590;
  export const BLAKE2B_184 = 45591;
  export const BLAKE2B_192 = 45592;
  export const BLAKE2B_200 = 45593;
  export const BLAKE2B_208 = 45594;
  export const BLAKE2B_216 = 45595;
  export const BLAKE2B_224 = 45596;
  export const BLAKE2B_232 = 45597;
  export const BLAKE2B_240 = 45598;
  export const BLAKE2B_248 = 45599;
  export const BLAKE2B_256 = 45600;
  export const BLAKE2B_264 = 45601;
  export const BLAKE2B_272 = 45602;
  export const BLAKE2B_280 = 45603;
  export const BLAKE2B_288 = 45604;
  export const BLAKE2B_296 = 45605;
  export const BLAKE2B_304 = 45606;
  export const BLAKE2B_312 = 45607;
  export const BLAKE2B_320 = 45608;
  export const BLAKE2B_328 = 45609;
  export const BLAKE2B_336 = 45610;
  export const BLAKE2B_344 = 45611;
  export const BLAKE2B_352 = 45612;
  export const BLAKE2B_360 = 45613;
  export const BLAKE2B_368 = 45614;
  export const BLAKE2B_376 = 45615;
  export const BLAKE2B_384 = 45616;
  export const BLAKE2B_392 = 45617;
  export const BLAKE2B_400 = 45618;
  export const BLAKE2B_408 = 45619;
  export const BLAKE2B_416 = 45620;
  export const BLAKE2B_424 = 45621;
  export const BLAKE2B_432 = 45622;
  export const BLAKE2B_440 = 45623;
  export const BLAKE2B_448 = 45624;
  export const BLAKE2B_456 = 45625;
  export const BLAKE2B_464 = 45626;
  export const BLAKE2B_472 = 45627;
  export const BLAKE2B_480 = 45628;
  export const BLAKE2B_488 = 45629;
  export const BLAKE2B_496 = 45630;
  export const BLAKE2B_504 = 45631;
  export const BLAKE2B_512 = 45632;
  export const BLAKE2S_8 = 45633;
  export const BLAKE2S_16 = 45634;
  export const BLAKE2S_24 = 45635;
  export const BLAKE2S_32 = 45636;
  export const BLAKE2S_40 = 45637;
  export const BLAKE2S_48 = 45638;
  export const BLAKE2S_56 = 45639;
  export const BLAKE2S_64 = 45640;
  export const BLAKE2S_72 = 45641;
  export const BLAKE2S_80 = 45642;
  export const BLAKE2S_88 = 45643;
  export const BLAKE2S_96 = 45644;
  export const BLAKE2S_104 = 45645;
  export const BLAKE2S_112 = 45646;
  export const BLAKE2S_120 = 45647;
  export const BLAKE2S_128 = 45648;
  export const BLAKE2S_136 = 45649;
  export const BLAKE2S_144 = 45650;
  export const BLAKE2S_152 = 45651;
  export const BLAKE2S_160 = 45652;
  export const BLAKE2S_168 = 45653;
  export const BLAKE2S_176 = 45654;
  export const BLAKE2S_184 = 45655;
  export const BLAKE2S_192 = 45656;
  export const BLAKE2S_200 = 45657;
  export const BLAKE2S_208 = 45658;
  export const BLAKE2S_216 = 45659;
  export const BLAKE2S_224 = 45660;
  export const BLAKE2S_232 = 45661;
  export const BLAKE2S_240 = 45662;
  export const BLAKE2S_248 = 45663;
  export const BLAKE2S_256 = 45664;
  export const SKEIN256_8 = 45825;
  export const SKEIN256_16 = 45826;
  export const SKEIN256_24 = 45827;
  export const SKEIN256_32 = 45828;
  export const SKEIN256_40 = 45829;
  export const SKEIN256_48 = 45830;
  export const SKEIN256_56 = 45831;
  export const SKEIN256_64 = 45832;
  export const SKEIN256_72 = 45833;
  export const SKEIN256_80 = 45834;
  export const SKEIN256_88 = 45835;
  export const SKEIN256_96 = 45836;
  export const SKEIN256_104 = 45837;
  export const SKEIN256_112 = 45838;
  export const SKEIN256_120 = 45839;
  export const SKEIN256_128 = 45840;
  export const SKEIN256_136 = 45841;
  export const SKEIN256_144 = 45842;
  export const SKEIN256_152 = 45843;
  export const SKEIN256_160 = 45844;
  export const SKEIN256_168 = 45845;
  export const SKEIN256_176 = 45846;
  export const SKEIN256_184 = 45847;
  export const SKEIN256_192 = 45848;
  export const SKEIN256_200 = 45849;
  export const SKEIN256_208 = 45850;
  export const SKEIN256_216 = 45851;
  export const SKEIN256_224 = 45852;
  export const SKEIN256_232 = 45853;
  export const SKEIN256_240 = 45854;
  export const SKEIN256_248 = 45855;
  export const SKEIN256_256 = 45856;
  export const SKEIN512_8 = 45857;
  export const SKEIN512_16 = 45858;
  export const SKEIN512_24 = 45859;
  export const SKEIN512_32 = 45860;
  export const SKEIN512_40 = 45861;
  export const SKEIN512_48 = 45862;
  export const SKEIN512_56 = 45863;
  export const SKEIN512_64 = 45864;
  export const SKEIN512_72 = 45865;
  export const SKEIN512_80 = 45866;
  export const SKEIN512_88 = 45867;
  export const SKEIN512_96 = 45868;
  export const SKEIN512_104 = 45869;
  export const SKEIN512_112 = 45870;
  export const SKEIN512_120 = 45871;
  export const SKEIN512_128 = 45872;
  export const SKEIN512_136 = 45873;
  export const SKEIN512_144 = 45874;
  export const SKEIN512_152 = 45875;
  export const SKEIN512_160 = 45876;
  export const SKEIN512_168 = 45877;
  export const SKEIN512_176 = 45878;
  export const SKEIN512_184 = 45879;
  export const SKEIN512_192 = 45880;
  export const SKEIN512_200 = 45881;
  export const SKEIN512_208 = 45882;
  export const SKEIN512_216 = 45883;
  export const SKEIN512_224 = 45884;
  export const SKEIN512_232 = 45885;
  export const SKEIN512_240 = 45886;
  export const SKEIN512_248 = 45887;
  export const SKEIN512_256 = 45888;
  export const SKEIN512_264 = 45889;
  export const SKEIN512_272 = 45890;
  export const SKEIN512_280 = 45891;
  export const SKEIN512_288 = 45892;
  export const SKEIN512_296 = 45893;
  export const SKEIN512_304 = 45894;
  export const SKEIN512_312 = 45895;
  export const SKEIN512_320 = 45896;
  export const SKEIN512_328 = 45897;
  export const SKEIN512_336 = 45898;
  export const SKEIN512_344 = 45899;
  export const SKEIN512_352 = 45900;
  export const SKEIN512_360 = 45901;
  export const SKEIN512_368 = 45902;
  export const SKEIN512_376 = 45903;
  export const SKEIN512_384 = 45904;
  export const SKEIN512_392 = 45905;
  export const SKEIN512_400 = 45906;
  export const SKEIN512_408 = 45907;
  export const SKEIN512_416 = 45908;
  export const SKEIN512_424 = 45909;
  export const SKEIN512_432 = 45910;
  export const SKEIN512_440 = 45911;
  export const SKEIN512_448 = 45912;
  export const SKEIN512_456 = 45913;
  export const SKEIN512_464 = 45914;
  export const SKEIN512_472 = 45915;
  export const SKEIN512_480 = 45916;
  export const SKEIN512_488 = 45917;
  export const SKEIN512_496 = 45918;
  export const SKEIN512_504 = 45919;
  export const SKEIN512_512 = 45920;
  export const SKEIN1024_8 = 45921;
  export const SKEIN1024_16 = 45922;
  export const SKEIN1024_24 = 45923;
  export const SKEIN1024_32 = 45924;
  export const SKEIN1024_40 = 45925;
  export const SKEIN1024_48 = 45926;
  export const SKEIN1024_56 = 45927;
  export const SKEIN1024_64 = 45928;
  export const SKEIN1024_72 = 45929;
  export const SKEIN1024_80 = 45930;
  export const SKEIN1024_88 = 45931;
  export const SKEIN1024_96 = 45932;
  export const SKEIN1024_104 = 45933;
  export const SKEIN1024_112 = 45934;
  export const SKEIN1024_120 = 45935;
  export const SKEIN1024_128 = 45936;
  export const SKEIN1024_136 = 45937;
  export const SKEIN1024_144 = 45938;
  export const SKEIN1024_152 = 45939;
  export const SKEIN1024_160 = 45940;
  export const SKEIN1024_168 = 45941;
  export const SKEIN1024_176 = 45942;
  export const SKEIN1024_184 = 45943;
  export const SKEIN1024_192 = 45944;
  export const SKEIN1024_200 = 45945;
  export const SKEIN1024_208 = 45946;
  export const SKEIN1024_216 = 45947;
  export const SKEIN1024_224 = 45948;
  export const SKEIN1024_232 = 45949;
  export const SKEIN1024_240 = 45950;
  export const SKEIN1024_248 = 45951;
  export const SKEIN1024_256 = 45952;
  export const SKEIN1024_264 = 45953;
  export const SKEIN1024_272 = 45954;
  export const SKEIN1024_280 = 45955;
  export const SKEIN1024_288 = 45956;
  export const SKEIN1024_296 = 45957;
  export const SKEIN1024_304 = 45958;
  export const SKEIN1024_312 = 45959;
  export const SKEIN1024_320 = 45960;
  export const SKEIN1024_328 = 45961;
  export const SKEIN1024_336 = 45962;
  export const SKEIN1024_344 = 45963;
  export const SKEIN1024_352 = 45964;
  export const SKEIN1024_360 = 45965;
  export const SKEIN1024_368 = 45966;
  export const SKEIN1024_376 = 45967;
  export const SKEIN1024_384 = 45968;
  export const SKEIN1024_392 = 45969;
  export const SKEIN1024_400 = 45970;
  export const SKEIN1024_408 = 45971;
  export const SKEIN1024_416 = 45972;
  export const SKEIN1024_424 = 45973;
  export const SKEIN1024_432 = 45974;
  export const SKEIN1024_440 = 45975;
  export const SKEIN1024_448 = 45976;
  export const SKEIN1024_456 = 45977;
  export const SKEIN1024_464 = 45978;
  export const SKEIN1024_472 = 45979;
  export const SKEIN1024_480 = 45980;
  export const SKEIN1024_488 = 45981;
  export const SKEIN1024_496 = 45982;
  export const SKEIN1024_504 = 45983;
  export const SKEIN1024_512 = 45984;
  export const SKEIN1024_520 = 45985;
  export const SKEIN1024_528 = 45986;
  export const SKEIN1024_536 = 45987;
  export const SKEIN1024_544 = 45988;
  export const SKEIN1024_552 = 45989;
  export const SKEIN1024_560 = 45990;
  export const SKEIN1024_568 = 45991;
  export const SKEIN1024_576 = 45992;
  export const SKEIN1024_584 = 45993;
  export const SKEIN1024_592 = 45994;
  export const SKEIN1024_600 = 45995;
  export const SKEIN1024_608 = 45996;
  export const SKEIN1024_616 = 45997;
  export const SKEIN1024_624 = 45998;
  export const SKEIN1024_632 = 45999;
  export const SKEIN1024_640 = 46000;
  export const SKEIN1024_648 = 46001;
  export const SKEIN1024_656 = 46002;
  export const SKEIN1024_664 = 46003;
  export const SKEIN1024_672 = 46004;
  export const SKEIN1024_680 = 46005;
  export const SKEIN1024_688 = 46006;
  export const SKEIN1024_696 = 46007;
  export const SKEIN1024_704 = 46008;
  export const SKEIN1024_712 = 46009;
  export const SKEIN1024_720 = 46010;
  export const SKEIN1024_728 = 46011;
  export const SKEIN1024_736 = 46012;
  export const SKEIN1024_744 = 46013;
  export const SKEIN1024_752 = 46014;
  export const SKEIN1024_760 = 46015;
  export const SKEIN1024_768 = 46016;
  export const SKEIN1024_776 = 46017;
  export const SKEIN1024_784 = 46018;
  export const SKEIN1024_792 = 46019;
  export const SKEIN1024_800 = 46020;
  export const SKEIN1024_808 = 46021;
  export const SKEIN1024_816 = 46022;
  export const SKEIN1024_824 = 46023;
  export const SKEIN1024_832 = 46024;
  export const SKEIN1024_840 = 46025;
  export const SKEIN1024_848 = 46026;
  export const SKEIN1024_856 = 46027;
  export const SKEIN1024_864 = 46028;
  export const SKEIN1024_872 = 46029;
  export const SKEIN1024_880 = 46030;
  export const SKEIN1024_888 = 46031;
  export const SKEIN1024_896 = 46032;
  export const SKEIN1024_904 = 46033;
  export const SKEIN1024_912 = 46034;
  export const SKEIN1024_920 = 46035;
  export const SKEIN1024_928 = 46036;
  export const SKEIN1024_936 = 46037;
  export const SKEIN1024_944 = 46038;
  export const SKEIN1024_952 = 46039;
  export const SKEIN1024_960 = 46040;
  export const SKEIN1024_968 = 46041;
  export const SKEIN1024_976 = 46042;
  export const SKEIN1024_984 = 46043;
  export const SKEIN1024_992 = 46044;
  export const SKEIN1024_1000 = 46045;
  export const SKEIN1024_1008 = 46046;
  export const SKEIN1024_1016 = 46047;
  export const SKEIN1024_1024 = 46048;
  export const HOLOCHAIN_ADR_V0 = 8417572;
  export const HOLOCHAIN_ADR_V1 = 8483108;
  export const HOLOCHAIN_KEY_V0 = 9728292;
  export const HOLOCHAIN_KEY_V1 = 9793828;
  export const HOLOCHAIN_SIG_V0 = 10645796;
  export const HOLOCHAIN_SIG_V1 = 1071133;
}
