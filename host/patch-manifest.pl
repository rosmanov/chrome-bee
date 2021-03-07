#!/usr/bin/perl
use warnings;
use strict;
use utf8;

my $json;
if ( eval "require JSON" ) {
	$json = JSON->new->utf8->canonical->pretty;
}
elsif ( eval "require JSON::PP" ) {
	$json = JSON::PP->new->utf8->canonical->pretty;
}
elsif ( eval "require JSON::XS" ) {
	$json = JSON::XS->new->utf8->canonical->pretty;
}
else {
	die "Could not import any JSON modules";
}

my ($infile, $host_path) = @ARGV;

open my $fh, '+<', $infile or die "Failed to open file '$infile'";
my $input = do { local $/; <$fh> };

my $decoded = $json->decode($input);

$decoded->{'path'} = $host_path;

my %result;
foreach my $key (sort keys %{$decoded}) {
  $result{$key} = $decoded->{$key};
}

truncate $fh, 0;
seek $fh, 0, 0;
print $fh $json->encode(\%result);
close $fh;
