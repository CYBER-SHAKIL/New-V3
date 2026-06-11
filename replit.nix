{pkgs}: {
  deps = [
    pkgs.gcc
    pkgs.gnumake
    pkgs.python3
    pkgs.pkg-config
    pkgs.pixman
    pkgs.librsvg
    pkgs.giflib
    pkgs.libjpeg
    pkgs.libpng
    pkgs.pango
    pkgs.cairo
    pkgs.lsof
    pkgs.libuuid
  ];
}
