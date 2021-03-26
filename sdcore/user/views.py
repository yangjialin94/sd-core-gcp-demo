from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect, reverse
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from .forms import RegistraionForm


@login_required
def home(request):
    # return render(request, "frontend/index.html", {})
    return HttpResponseRedirect(reverse("frontend:index"))


def register(request):
    if request.method == "POST":
        # form = UserCreationForm(request.POST)
        form = RegistraionForm(request.POST)
        if form.is_valid():
            form.save()
            user = form.save()
            login(request, user)
            return redirect("home")
    else:
        # form = UserCreationForm()
        form = RegistraionForm()
    return render(request, "registration/register.html", {"form": form})
