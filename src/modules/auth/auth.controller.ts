import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, HttpCode, Post, Req, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { ApiHttpException } from "../../common/decorators/api-http-exception.decorator";
import { UserDto } from "../users/dto/user.dto";
import { AuthService } from "./auth.service";
import { GetUserId } from "./decorators/get-user-id.decorator";
import { GoogleOAuthUrlSuccessResponseDto, SignInDto, SignInSuccessResponseDto, SignUpDto, SignUpSuccessResponseDto } from "./dtos/auth.dto";
import { GoogleOAuthDto } from "./dtos/google-oauth.dto";
import { ChangePasswordDto, GetPasswordResponseDto, RequestPasswordResetDto, ResetPasswordWithCodeDto } from "./dtos/password.dto";
import { ChangeUsernameDto } from "./dtos/username.dto";
import { AuthGuard } from "./guards/auth.guard";

@ApiTags("Auth")
@Controller("auth")
@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @Get("me")
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDto })
  @ApiHttpException(() => [UnauthorizedException])
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getUser(@GetUserId() userId: string) {
    return this.authService.getUser(userId);
  }

  @Post("sign-in")
  @ApiOkResponse({ type: SignInSuccessResponseDto })
  @ApiHttpException(() => [BadRequestException, UnauthorizedException])
  @HttpCode(200)
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post("sign-up")
  @ApiOkResponse({ type: SignUpSuccessResponseDto })
  @ApiHttpException(() => [BadRequestException])
  @HttpCode(200)
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Get("google-oauth")
  @ApiOkResponse({ type: GoogleOAuthUrlSuccessResponseDto })
  @HttpCode(200)
  async getGoogleOAuth(@Req() req: Request) {
    return this.authService.getGoogleOAuth(req, "/auth/google-oauth/callback");
  }

  @Get("google-oauth/callback")
  @ApiOkResponse({ type: SignInSuccessResponseDto })
  @ApiHttpException(() => [BadRequestException, UnauthorizedException])
  @HttpCode(200)
  async googleOAuthCallback(@Req() req: Request) {
    return this.authService.googleOAuthCallback(req);
  }

  @Post("sign-in-with-google")
  @ApiOkResponse({ type: SignInSuccessResponseDto })
  @ApiHttpException(() => [BadRequestException, UnauthorizedException])
  @HttpCode(200)
  async googleSignIn(@Body() dto: GoogleOAuthDto) {
    return this.authService.signInWithGoogle(dto);
  }

  @Post("change-username")
  @ApiBearerAuth()
  @ApiHttpException(() => [BadRequestException, UnauthorizedException])
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async changeUsername(@GetUserId() userId: string, @Body() dto: ChangeUsernameDto) {
    return this.authService.changeUsername(userId, dto);
  }

  @Get("password")
  @ApiResponse({ type: GetPasswordResponseDto })
  @ApiHttpException(() => [UnauthorizedException])
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getPassword(@GetUserId() userId: string) {
    return this.authService.getPassword(userId);
  }

  @Post("change-password")
  @ApiHttpException(() => [BadRequestException, UnauthorizedException])
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async changePassword(@GetUserId() userId: string, @Body() dto: ChangePasswordDto) {
    if (dto.oldPassword) {
      return this.authService.chagePassword(userId, dto);
    }
    else {
      return this.authService.createPassword(userId, dto);
    }
  }

  @Post("request-password-reset")
  @ApiHttpException(() => [BadRequestException])
  @HttpCode(200)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post("reset-password-with-code")
  @ApiHttpException(() => [BadRequestException])
  @HttpCode(200)
  async resetPasswordWithCode(@Body() dto: ResetPasswordWithCodeDto) {
    return this.authService.resetPasswordWithCode(dto);
  }
}
