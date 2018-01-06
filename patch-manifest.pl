#!/usr/bin/perl
use warnings;
use strict;
use utf8;
use JSON;

my ($infile, $version, $browser) = @ARGV;

open my $fh, '+<', $infile or die "Failed to open file '$infile'";
my $input = do { local $/; <$fh> };

my $json = JSON->new;
my $decoded = $json->decode($input);

$decoded->{'version'} = $version;

if ($browser ne 'firefox') {
  delete $decoded->{'applications'};
  delete $decoded->{'options_ui'}{'browser_style'}
}


my %result;
foreach my $key (sort keys %{$decoded}) {
  $result{$key} = $decoded->{$key};
}

truncate $fh, 0;
seek $fh, 0, 0;
print $fh $json->canonical->pretty(1)->encode(\%result);
close $fh;
